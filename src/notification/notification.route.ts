import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateNotificationSchema, UpdateNotificationSchema } from "./dto/notification.dto";
import { authenticateToken } from "../common/middlewares/auth.middleware";

export class NotificationRoute {
    public router: Router;
    private notificationController: NotificationController;

    constructor() {
        this.router = Router();
        this.notificationController = new NotificationController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use(authenticateToken);

        this.router.post(
            "/",
            validateRequest(CreateNotificationSchema),
            this.notificationController.createNotification
        );

        this.router.get("/", this.notificationController.getAllNotifications);
        this.router.get("/:id", this.notificationController.getNotificationById);
        this.router.post("/mark-all-read", this.notificationController.markAllAsRead);

        this.router.put(
            "/:id",
            validateRequest(UpdateNotificationSchema),
            this.notificationController.updateNotification
        );

        this.router.delete("/:id", this.notificationController.deleteNotification);
    }
}
