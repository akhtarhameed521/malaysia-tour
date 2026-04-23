import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { jwtVerify } from "../common/helper/auth.helper";
import AppDataSource from "../config/db-config";
import { EmployeeEntity } from "../entities/employee.entity";

const chatService = new ChatService();
const employeeRepository = AppDataSource.getRepository(EmployeeEntity);

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map<number, Set<string>>();

export const registerChatSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        let authenticatedUserId: number | null = null;

        console.log(`[Chat Socket] New connection: ${socket.id}`);

        // ─── AUTH ──────────────────────────────────────────────
        // Client must emit "authenticate" with { token } immediately after connecting
        socket.on("authenticate", async (data: { token: string }) => {
            try {
                const decoded = jwtVerify(data.token) as { id: number; employeeId: string; fullName: string };
                authenticatedUserId = decoded.id;

                // Track online status
                if (!onlineUsers.has(decoded.id)) {
                    onlineUsers.set(decoded.id, new Set());
                }
                onlineUsers.get(decoded.id)!.add(socket.id);

                // Auto-join the global room socket channel
                const globalRoom = await chatService.ensureGlobalRoom();
                const roomChannel = `room_${globalRoom.id}`;
                socket.join(roomChannel);

                socket.emit("authenticated", {
                    success: true,
                    userId: decoded.id,
                    fullName: decoded.fullName,
                    globalRoomId: globalRoom.id,
                });

                // Notify room that user is online
                socket.to(roomChannel).emit("user_online", {
                    userId: decoded.id,
                    fullName: decoded.fullName,
                });

                console.log(`[Chat Socket] User ${decoded.fullName} (${decoded.id}) authenticated`);
            } catch (error) {
                socket.emit("auth_error", { message: "Invalid or expired token" });
            }
        });

        // ─── JOIN ROOM ─────────────────────────────────────────
        socket.on("join_room", async (data: { chatRoomId: number }) => {
            if (!authenticatedUserId) {
                return socket.emit("error", { message: "Not authenticated" });
            }
            const roomChannel = `room_${data.chatRoomId}`;
            socket.join(roomChannel);
            socket.emit("joined_room", { chatRoomId: data.chatRoomId });
        });

        // ─── SEND MESSAGE ─────────────────────────────────────
        socket.on("send_message", async (data: { chatRoomId: number; content: string; messageType?: string }) => {
            if (!authenticatedUserId) {
                return socket.emit("error", { message: "Not authenticated" });
            }

            try {
                const result = await chatService.sendMessage(authenticatedUserId, {
                    chatRoomId: data.chatRoomId,
                    content: data.content,
                    messageType: (data.messageType as any) || "text",
                });

                const roomChannel = `room_${data.chatRoomId}`;

                // Broadcast to all members in the room (including sender)
                io.to(roomChannel).emit("new_message", result.data);
            } catch (error: any) {
                socket.emit("error", { message: error.message || "Failed to send message" });
            }
        });

        // ─── EDIT MESSAGE ─────────────────────────────────────
        socket.on("edit_message", async (data: { messageId: number; content: string }) => {
            if (!authenticatedUserId) {
                return socket.emit("error", { message: "Not authenticated" });
            }

            try {
                const result = await chatService.editMessage(authenticatedUserId, data.messageId, {
                    content: data.content,
                });

                const roomChannel = `room_${result.data.chatRoomId}`;

                // Broadcast to all members in the room
                io.to(roomChannel).emit("message_edited", result.data);
            } catch (error: any) {
                socket.emit("error", { message: error.message || "Failed to edit message" });
            }
        });

        // ─── DELETE MESSAGE ───────────────────────────────────
        socket.on("delete_message", async (data: { messageId: number }) => {
            if (!authenticatedUserId) {
                return socket.emit("error", { message: "Not authenticated" });
            }

            try {
                const result = await chatService.deleteMessage(authenticatedUserId, data.messageId);
                const roomChannel = `room_${result.data.chatRoomId}`;

                // Broadcast to all members in the room
                io.to(roomChannel).emit("message_deleted", { messageId: data.messageId });
            } catch (error: any) {
                socket.emit("error", { message: error.message || "Failed to delete message" });
            }
        });

        // ─── TYPING INDICATOR ──────────────────────────────────
        socket.on("typing_start", async (data: { chatRoomId: number }) => {
            if (!authenticatedUserId) return;

            // Check if user is blocked
            const user = await employeeRepository.findOneBy({ id: authenticatedUserId });
            if (user?.isChatBlocked) return;

            const roomChannel = `room_${data.chatRoomId}`;
            socket.to(roomChannel).emit("user_typing", {
                userId: authenticatedUserId,
                chatRoomId: data.chatRoomId,
            });
        });

        socket.on("typing_stop", (data: { chatRoomId: number }) => {
            if (!authenticatedUserId) return;
            const roomChannel = `room_${data.chatRoomId}`;
            socket.to(roomChannel).emit("user_stop_typing", {
                userId: authenticatedUserId,
                chatRoomId: data.chatRoomId,
            });
        });

        // ─── MARK AS READ ──────────────────────────────────────
        socket.on("mark_read", async (data: { chatRoomId: number }) => {
            if (!authenticatedUserId) {
                return socket.emit("error", { message: "Not authenticated" });
            }

            try {
                const result = await chatService.markAsRead(authenticatedUserId, {
                    chatRoomId: data.chatRoomId,
                });

                socket.emit("messages_read", {
                    chatRoomId: data.chatRoomId,
                    markedCount: result.data.markedCount,
                });

                // Notify other users that this user has read messages
                const roomChannel = `room_${data.chatRoomId}`;
                socket.to(roomChannel).emit("user_read_messages", {
                    userId: authenticatedUserId,
                    chatRoomId: data.chatRoomId,
                });
            } catch (error: any) {
                socket.emit("error", { message: error.message || "Failed to mark as read" });
            }
        });

        // ─── GET ONLINE USERS ──────────────────────────────────
        socket.on("get_online_users", () => {
            const onlineUserIds = Array.from(onlineUsers.keys());
            socket.emit("online_users", { users: onlineUserIds });
        });

        // ─── DISCONNECT ────────────────────────────────────────
        socket.on("disconnect", async () => {
            if (authenticatedUserId) {
                const userSockets = onlineUsers.get(authenticatedUserId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        onlineUsers.delete(authenticatedUserId);

                        // Notify rooms that user went offline
                        const globalRoom = await chatService.ensureGlobalRoom();
                        const roomChannel = `room_${globalRoom.id}`;
                        io.to(roomChannel).emit("user_offline", {
                            userId: authenticatedUserId,
                        });
                    }
                }
            }
            console.log(`[Chat Socket] Disconnected: ${socket.id}`);
        });
    });
};
