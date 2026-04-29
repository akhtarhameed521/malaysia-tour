import { Request, Response, NextFunction } from "express";
import { ChatService } from "./chat.service";
import { asyncHandler } from "../common/helper/async-handler.helper";
import { getIo } from "../config/socket";

export class ChatController {
    private chatService: ChatService;

    constructor() {
        this.chatService = new ChatService();
    }

    /**
     * GET /api/chat/room
     * Get the global shared chat room details & members
     */
    getGlobalRoom = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.chatService.getGlobalRoom();
        res.status(result.statusCode).json(result);
    });

    /**
     * POST /api/chat/messages
     * Send a message to the shared chat room (API fallback)
     */
    sendMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const senderId = req.user!.id;
        const files = req.files as Express.Multer.File[];
        const imagePath = files?.[0]?.path;
        const result = await this.chatService.sendMessage(senderId, req.body, imagePath);

        // Emit socket event for real-time update
        try {
            const io = getIo();
            const roomChannel = `room_${result.data.chatRoomId}`;
            io.to(roomChannel).emit("new_message", result.data);
        } catch (socketError) {
            console.error("Failed to emit socket event for new message:", socketError);
        }

        res.status(result.statusCode).json(result);
    });

    /**
     * GET /api/chat/messages/:chatRoomId
     * Get paginated messages for a chat room
     */
    getMessages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const chatRoomId = Number(req.params.chatRoomId);
        const userId = req.user!.id;
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const result = await this.chatService.getMessages(chatRoomId, userId, page, limit);
        res.status(result.statusCode).json(result);
    });

    /**
     * POST /api/chat/mark-read
     * Mark all messages in a chat room as read
     */
    markAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const result = await this.chatService.markAsRead(userId, req.body);
        res.status(result.statusCode).json(result);
    });

    /**
     * GET /api/chat/unread/:chatRoomId
     * Get unread message count for a chat room
     */
    getUnreadCount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const chatRoomId = Number(req.params.chatRoomId);
        const result = await this.chatService.getUnreadCount(userId, chatRoomId);
        res.status(result.statusCode).json(result);
    });

    /**
     * PATCH /api/chat/messages/:messageId
     * Edit an existing message
     */
    editMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const messageId = Number(req.params.messageId);
        const result = await this.chatService.editMessage(userId, messageId, req.body);

        // Emit socket event for real-time update
        try {
            const io = getIo();
            const roomChannel = `room_${result.data.chatRoomId}`;
            io.to(roomChannel).emit("message_edited", result.data);
        } catch (socketError) {
            console.error("Failed to emit socket event for edited message:", socketError);
        }

        res.status(result.statusCode).json(result);
    });

    /**
     * DELETE /api/chat/messages/:messageId
     * Delete an existing message
     */
    deleteMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const messageId = Number(req.params.messageId);
        const result = await this.chatService.deleteMessage(userId, messageId);

        // Emit socket event for real-time update
        try {
            const io = getIo();
            const roomChannel = `room_${result.data.chatRoomId}`;
            io.to(roomChannel).emit("message_deleted", { messageId: result.data.messageId });
        } catch (socketError) {
            console.error("Failed to emit socket event for deleted message:", socketError);
        }

        res.status(result.statusCode).json(result);
    });

    /**
     * GET /api/chat/images
     * Get all images uploaded in any chat room
     */
    getAllImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const result = await this.chatService.getAllChatImages(page, limit);
        res.status(result.statusCode).json(result);
    });

    /**
     * POST /api/chat/block/:userId
     * Toggle block status for a user in the chat module
     */
    toggleBlockUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = Number(req.params.userId);
        const result = await this.chatService.toggleBlockUser(userId);
        res.status(result.statusCode).json(result);
    });
}
