import AppDataSource from "../config/db-config";
import { ChatRoom } from "./entities/chat-room.entity";
import { ChatMessage } from "./entities/chat-message.entity";
import { EmployeeEntity } from "../entities/employee.entity";
import { SendMessageDto, MarkAsReadDto, EditMessageDto } from "./dto/chat.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { In } from "typeorm";
import * as path from "path";

const GLOBAL_ROOM_NAME = "Shared Chat";

export class ChatService {
    private chatRoomRepository = AppDataSource.getRepository(ChatRoom);
    private chatMessageRepository = AppDataSource.getRepository(ChatMessage);
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);

    /**
     * Ensures the global shared chat room exists. Creates it if not found.
     * Returns the global room.
     */
    async ensureGlobalRoom(): Promise<ChatRoom> {
        let globalRoom = await this.chatRoomRepository.findOne({
            where: { isGlobal: true },
            relations: ["members"],
        });

        // Fetch all employees with email and password
        // Note: password has select: false, so we need to addSelect if we want to check it in JS,
        // but checking in SQL is better.
        const eligibleEmployees = await this.employeeRepository
            .createQueryBuilder("employee")
            .where("employee.email IS NOT NULL")
            .andWhere("employee.password IS NOT NULL")
            .getMany();

        if (!globalRoom) {
            globalRoom = this.chatRoomRepository.create({
                name: GLOBAL_ROOM_NAME,
                description: "Shared chat room for all users",
                isGlobal: true,
                members: eligibleEmployees,
            });
            await this.chatRoomRepository.save(globalRoom);
        } else {
            // Sync members: add eligible employees who are not already in the room
            const currentMemberIds = new Set(globalRoom.members.map(m => m.id));
            const newMembers = eligibleEmployees.filter(e => !currentMemberIds.has(e.id));
            
            if (newMembers.length > 0) {
                globalRoom.members.push(...newMembers);
                await this.chatRoomRepository.save(globalRoom);
            }
        }

        return globalRoom;
    }

    /**
     * Adds an employee to the global shared chat room.
     * Called automatically when a new user is created.
     */
    async addUserToGlobalRoom(employeeId: number): Promise<void> {
        const globalRoom = await this.ensureGlobalRoom();

        const employee = await this.employeeRepository
            .createQueryBuilder("employee")
            .addSelect("employee.password")
            .where("employee.id = :id", { id: employeeId })
            .getOne();

        if (!employee || !employee.email || !employee.password) return;

        // Check if already a member
        const isMember = globalRoom.members.some((m) => m.id === employeeId);
        if (isMember) return;

        globalRoom.members.push(employee);
        await this.chatRoomRepository.save(globalRoom);
    }

    /**
     * Gets the global shared chat room details with members list.
     */
    async getGlobalRoom(): Promise<ApiResponse<any>> {
        const globalRoom = await this.ensureGlobalRoom();

        const roomWithMembers = await this.chatRoomRepository.findOne({
            where: { id: globalRoom.id },
            relations: ["members"],
        });

        // Sanitize member data (remove passwords)
        const sanitizedMembers = roomWithMembers.members.map((m) => ({
            id: m.id,
            fullName: m.fullName,
            email: m.email,
            image: m.image,
            employeeId: m.employeeId,
            status: m.status,
        }));

        return new ApiResponse(statusCode.OK, {
            id: roomWithMembers.id,
            name: roomWithMembers.name,
            description: roomWithMembers.description,
            isGlobal: roomWithMembers.isGlobal,
            membersCount: sanitizedMembers.length,
            members: sanitizedMembers,
            createdAt: roomWithMembers.createdAt,
        }, "Global chat room retrieved successfully");
    }

    /**
     * Sends a message to the global shared chat room.
     */
    async sendMessage(senderId: number, data: SendMessageDto, imagePath?: string): Promise<ApiResponse<ChatMessage>> {
        const { chatRoomId, content, messageType } = data;

        // Verify room exists
        const room = await this.chatRoomRepository.findOne({
            where: { id: chatRoomId },
            relations: ["members"],
        });
        if (!room) {
            throw new ApiError(statusCode.NotFound, "Chat room not found");
        }

        // Verify sender is a member
        const isMember = room.members.find((m) => m.id === senderId);
        if (!isMember) {
            throw new ApiError(statusCode.Forbidden, "You are not a member of this chat room");
        }

        // Check if user is blocked
        if (isMember.isChatBlocked) {
            throw new ApiError(statusCode.Forbidden, "Your chat access has been restricted");
        }

        // Handle image path
        let finalContent = content || "";
        let finalMessageType = messageType || "text";

        if (imagePath) {
            const baseUrl = process.env.BASE_URL;
            const imageUrl = `${baseUrl}/Uploads/${path.basename(imagePath)}`;
            finalContent = imageUrl;
            finalMessageType = "image";
        }

        const message = this.chatMessageRepository.create({
            content: finalContent,
            messageType: finalMessageType,
            senderId,
            chatRoomId,
            readBy: [senderId], // sender has read their own message
        });

        await this.chatMessageRepository.save(message);

        // Re-fetch with sender relation for response
        const savedMessage = await this.chatMessageRepository.findOne({
            where: { id: message.id },
            relations: ["sender"],
        });

        return new ApiResponse(statusCode.Created, savedMessage, "Message sent successfully");
    }

    /**
     * Retrieves paginated messages for a chat room.
     */
    async getMessages(chatRoomId: number, userId: number, page: number = 1, limit: number = 50): Promise<ApiResponse<any>> {
        // Verify room exists
        const room = await this.chatRoomRepository.findOne({
            where: { id: chatRoomId },
            relations: ["members"],
        });
        if (!room) {
            throw new ApiError(statusCode.NotFound, "Chat room not found");
        }

        // Verify user is a member
        const isMember = room.members.some((m) => m.id === userId);
        if (!isMember) {
            throw new ApiError(statusCode.Forbidden, "You are not a member of this chat room");
        }

        const [messages, total] = await this.chatMessageRepository.findAndCount({
            where: { chatRoomId },
            relations: ["sender"],
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });

        const lastPage = Math.ceil(total / limit);

        // Get all unique user IDs from all readBy arrays
        const allReadByIds = new Set<number>();
        messages.forEach(msg => {
            if (msg.readBy) msg.readBy.forEach(id => allReadByIds.add(id));
        });

        // Fetch user info for all these IDs
        const readers = allReadByIds.size > 0 
            ? await this.employeeRepository.find({
                where: { id: In(Array.from(allReadByIds)) },
                select: ["id", "fullName", "image", "email", "role"]
            })
            : [];

        const readerMap = new Map(readers.map(r => [r.id, r]));

        // Sanitize sender data and include full reader info
        const sanitizedMessages = messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            messageType: msg.messageType,
            senderId: msg.senderId,
            sender: {
                id: msg.sender.id,
                fullName: msg.sender.fullName,
                image: msg.sender.image,
                employeeId: msg.sender.employeeId,
            },
            chatRoomId: msg.chatRoomId,
            readBy: (msg.readBy || []).map(id => readerMap.get(id)).filter(Boolean),
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
        }));

        return new ApiResponse(statusCode.OK, sanitizedMessages, "Messages retrieved successfully", page, total, lastPage);
    }

    /**
     * Edits an existing message.
     */
    async editMessage(userId: number, messageId: number, data: EditMessageDto): Promise<ApiResponse<ChatMessage>> {
        const message = await this.chatMessageRepository.findOne({
            where: { id: messageId },
            relations: ["sender"]
        });

        if (!message) {
            throw new ApiError(statusCode.NotFound, "Message not found");
        }

        if (message.senderId !== userId) {
            throw new ApiError(statusCode.Forbidden, "You can only edit your own messages");
        }

        const sender = await this.employeeRepository.findOneBy({ id: userId });
        if (sender?.isChatBlocked) {
            throw new ApiError(statusCode.Forbidden, "Your chat access has been restricted");
        }

        message.content = data.content;
        await this.chatMessageRepository.save(message);

        return new ApiResponse(statusCode.OK, message, "Message updated successfully");
    }

    /**
     * Marks all messages in a chat room as read by the user.
     */
    async markAsRead(userId: number, data: MarkAsReadDto): Promise<ApiResponse<any>> {
        const { chatRoomId } = data;

        // Verify room exists and user is a member
        const room = await this.chatRoomRepository.findOne({
            where: { id: chatRoomId },
            relations: ["members"],
        });
        if (!room) {
            throw new ApiError(statusCode.NotFound, "Chat room not found");
        }

        const isMember = room.members.some((m) => m.id === userId);
        if (!isMember) {
            throw new ApiError(statusCode.Forbidden, "You are not a member of this chat room");
        }

        // Get all unread messages for this user in this room
        const unreadMessages = await this.chatMessageRepository
            .createQueryBuilder("msg")
            .where("msg.chatRoomId = :chatRoomId", { chatRoomId })
            .andWhere("NOT (:userId = ANY(msg.readBy))", { userId })
            .getMany();

        if (unreadMessages.length > 0) {
            for (const msg of unreadMessages) {
                if (!msg.readBy.includes(userId)) {
                    msg.readBy.push(userId);
                }
            }
            await this.chatMessageRepository.save(unreadMessages);
        }

        return new ApiResponse(statusCode.OK, { markedCount: unreadMessages.length }, "Messages marked as read");
    }

    /**
     * Gets unread count for a user in a specific room.
     */
    async getUnreadCount(userId: number, chatRoomId: number): Promise<ApiResponse<any>> {
        const count = await this.chatMessageRepository
            .createQueryBuilder("msg")
            .where("msg.chatRoomId = :chatRoomId", { chatRoomId })
            .andWhere("NOT (:userId = ANY(msg.readBy))", { userId })
            .getCount();

        return new ApiResponse(statusCode.OK, { unreadCount: count }, "Unread count retrieved");
    }

    /**
     * Gets all images uploaded in any chat room by any user.
     */
    async getAllChatImages(page: number = 1, limit: number = 50): Promise<ApiResponse<any>> {
        const [messages, total] = await this.chatMessageRepository.findAndCount({
            where: { messageType: "image" },
            relations: ["sender"],
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });

        const lastPage = Math.ceil(total / limit);

        const images = messages.map(msg => ({
            id: msg.id,
            imageUrl: msg.content,
            senderId: msg.senderId,
            senderName: msg.sender?.fullName,
            senderImage: msg.sender?.image,
            createdAt: msg.createdAt,
            chatRoomId: msg.chatRoomId
        }));

        return new ApiResponse(statusCode.OK, images, "Chat images retrieved successfully", page, total, lastPage);
    }

    /**
     * Deletes a message.
     */
    async deleteMessage(userId: number, messageId: number): Promise<ApiResponse<any>> {
        const message = await this.chatMessageRepository.findOneBy({ id: messageId });

        if (!message) {
            throw new ApiError(statusCode.NotFound, "Message not found");
        }

        if (message.senderId !== userId) {
            throw new ApiError(statusCode.Forbidden, "You can only delete your own messages");
        }

        const sender = await this.employeeRepository.findOneBy({ id: userId });
        if (sender?.isChatBlocked) {
            throw new ApiError(statusCode.Forbidden, "Your chat access has been restricted");
        }

        const chatRoomId = message.chatRoomId;
        await this.chatMessageRepository.remove(message);

        return new ApiResponse(statusCode.OK, { messageId, chatRoomId }, "Message deleted successfully");
    }

    /**
     * Toggles the block status of a user.
     */
    async toggleBlockUser(userId: number): Promise<ApiResponse<EmployeeEntity>> {
        const employee = await this.employeeRepository.findOneBy({ id: userId });
        if (!employee) {
            throw new ApiError(statusCode.NotFound, "User not found");
        }

        employee.isChatBlocked = !employee.isChatBlocked;
        await this.employeeRepository.save(employee);

        const status = employee.isChatBlocked ? "blocked" : "unblocked";
        return new ApiResponse(statusCode.OK, employee, `User chat access ${status} successfully`);
    }
}
