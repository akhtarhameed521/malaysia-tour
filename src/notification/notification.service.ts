import AppDataSource from "../config/db-config";
import { Notification } from "./entities/notification.entity";
import { CreateNotificationDto, UpdateNotificationDto } from "./dto/notification.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { StatusEnum } from "../types";
import { Not } from "typeorm";
import admin from "../common/config/firebase-keys.config";
import { EmployeeEntity } from "../entities/employee.entity";

export class NotificationService {
    private notificationRepository = AppDataSource.getRepository(Notification);
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);

    async createNotification(data: CreateNotificationDto): Promise<ApiResponse<Notification>> {
        const notification = this.notificationRepository.create(data);
        await this.notificationRepository.save(notification);

        // Send Push Notification to all employees with FCM tokens
        this.sendPushNotificationToAll(notification.title, notification.message);

        return new ApiResponse(statusCode.Created, notification, "Notification created successfully");
    }

    private async sendPushNotificationToAll(title: string, message: string) {
        try {
            const employees = await this.employeeRepository
                .createQueryBuilder("employee")
                .where("employee.fcmToken IS NOT NULL")
                .andWhere("employee.fcmToken != :empty", { empty: "" })
                .getMany();

            const tokens = employees.map(e => e.fcmToken);

            if (tokens.length === 0) return;

            const payload = {
                notification: {
                    title: title,
                    body: message,
                },
                data: {
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                    type: "general"
                }
            };

            const response = await admin.messaging().sendEachForMulticast({
                tokens: tokens,
                notification: payload.notification,
                data: payload.data
            });

            console.log(`Successfully sent ${response.successCount} push notifications. Failures: ${response.failureCount}`);
        } catch (error) {
            console.error("Error sending push notifications:", error);
        }
    }

    async getAllNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<Notification[]>> {
        const [notifications, total] = await this.notificationRepository.findAndCount({
            where: { 
                status: Not(StatusEnum.Deactivate)
            },
            order: { order: "ASC", createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });

        const lastPage = Math.ceil(total / limit);
        return new ApiResponse(statusCode.OK, notifications, "Notifications retrieved successfully", page, total, lastPage);
    }

    async getNotificationById(id: number): Promise<ApiResponse<Notification>> {
        const notification = await this.notificationRepository.findOneBy({ 
            id,
            status: Not(StatusEnum.Deactivate)
        });
        if (!notification) {
            throw new ApiError(statusCode.NotFound, "Notification not found");
        }
        return new ApiResponse(statusCode.OK, notification, "Notification retrieved successfully");
    }

    async updateNotification(id: number, data: UpdateNotificationDto): Promise<ApiResponse<Notification>> {
        const notification = await this.notificationRepository.findOneBy({ id });
        if (!notification || notification.status === StatusEnum.Deactivate) {
            throw new ApiError(statusCode.NotFound, "Notification not found");
        }

        Object.assign(notification, data);
        await this.notificationRepository.save(notification);
        return new ApiResponse(statusCode.OK, notification, "Notification updated successfully");
    }

    async markAllAsRead(): Promise<ApiResponse<any>> {
        await this.notificationRepository.update({ isRead: false }, { isRead: true });
        return new ApiResponse(statusCode.OK, null, "All notifications marked as read");
    }

    async deleteNotification(id: number): Promise<ApiResponse<null>> {
        const notification = await this.notificationRepository.findOneBy({ id });
        if (!notification || notification.status === StatusEnum.Deactivate) {
            throw new ApiError(statusCode.NotFound, "Notification not found");
        }

        notification.status = StatusEnum.Deactivate;
        await this.notificationRepository.save(notification);
        return new ApiResponse(statusCode.OK, null, "Notification deleted successfully");
    }
}
