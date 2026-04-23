import { Router } from "express";
import { ChatController } from "./chat.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { SendMessageSchema, MarkAsReadSchema, EditMessageSchema } from "./dto/chat.dto";
import { authenticateToken } from "../common/middlewares/auth.middleware";
import { upload } from "../common/provider/multer.provider";

export class ChatRoute {
    public router: Router;
    private chatController: ChatController;

    constructor() {
        this.router = Router();
        this.chatController = new ChatController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // All chat routes require authentication
        this.router.use(authenticateToken);

        // Get global shared chat room info & members
        this.router.get("/room", this.chatController.getGlobalRoom);

        // Send a message via API
        this.router.post("/messages", upload.any(), validateRequest(SendMessageSchema), this.chatController.sendMessage);

        // Get paginated messages for a room
        this.router.get("/messages/:chatRoomId", this.chatController.getMessages);

        // Mark messages as read
        this.router.post("/mark-read", validateRequest(MarkAsReadSchema), this.chatController.markAsRead);

        // Get unread count for a room
        this.router.get("/unread/:chatRoomId", this.chatController.getUnreadCount);

        // Get all chat images
        this.router.get("/images", this.chatController.getAllImages);

        // Edit a message
        this.router.patch("/messages/:messageId", validateRequest(EditMessageSchema), this.chatController.editMessage);

        // Delete a message
        this.router.delete("/messages/:messageId", this.chatController.deleteMessage);

        // Block/Unblock user in chat
        this.router.post("/block/:userId", this.chatController.toggleBlockUser);
    }
}
