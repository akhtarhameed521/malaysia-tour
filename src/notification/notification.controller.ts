import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    createNotification = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.notificationService.createNotification(req.body);
        res.status(result.statusCode).json(result);
    });

    getAllNotifications = asyncHandler(async (req: Request, res: Response) => {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
        const result = await this.notificationService.getAllNotifications(page, limit, employeeId);
        res.status(result.statusCode).json(result);
    });

    getNotificationById = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await this.notificationService.getNotificationById(id);
        res.status(result.statusCode).json(result);
    });

    updateNotification = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await this.notificationService.updateNotification(id, req.body);
        res.status(result.statusCode).json(result);
    });

    markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.notificationService.markAllAsRead();
        res.status(result.statusCode).json(result);
    });

    markAsRead = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await this.notificationService.markAsRead(id);
        res.status(result.statusCode).json(result);
    });

    deleteNotification = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await this.notificationService.deleteNotification(id);
        res.status(result.statusCode).json(result);
    });
}
