import AppDataSource from "../config/db-config";
import { Notification } from "./entities/notification.entity";
import { CreateNotificationDto, UpdateNotificationDto } from "./dto/notification.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { StatusEnum } from "../types";
import { Not, Brackets } from "typeorm";
import admin from "../common/config/firebase-keys.config";
import { EmployeeEntity } from "../entities/employee.entity";

export class NotificationService {
    private notificationRepository = AppDataSource.getRepository(Notification);
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);

    async createNotification(data: CreateNotificationDto): Promise<ApiResponse<Notification>> {
        const { employeeId, ...notifData } = data;
        const notification = this.notificationRepository.create(notifData);

        if (employeeId) {
            const employee = await this.employeeRepository.findOneBy({ id: employeeId });
            if (!employee) throw new ApiError(statusCode.NotFound, "Employee not found");
            notification.employee = employee;
        }

        await this.notificationRepository.save(notification);

        // Send Push Notification
        if (employeeId) {
            const employee = await this.employeeRepository.findOneBy({ id: employeeId });
            if (employee?.fcmToken) {
                this.sendPushNotification([employee.fcmToken], notification.title, notification.message);
            }
        } else {
            this.sendPushNotificationToAll(notification.title, notification.message);
        }

        return new ApiResponse(statusCode.Created, notification, "Notification created successfully");
    }

    private async sendPushNotification(tokens: string[], title: string, message: string) {
        try {
            if (tokens.length === 0) return;

            const payload = {
                notification: { title, body: message },
                data: { click_action: "FLUTTER_NOTIFICATION_CLICK", type: "general" }
            };

            const response = await admin.messaging().sendEachForMulticast({
                tokens: tokens,
                notification: payload.notification,
                data: payload.data
            });

            console.log(`Successfully sent ${response.successCount} push notifications.`);
        } catch (error) {
            console.error("Error sending push notifications:", error);
        }
    }

    private async sendPushNotificationToAll(title: string, message: string) {
        try {
            const employees = await this.employeeRepository
                .createQueryBuilder("employee")
                .where("employee.fcmToken IS NOT NULL")
                .andWhere("employee.fcmToken != :empty", { empty: "" })
                .getMany();

            const tokens = employees.map(e => e.fcmToken).filter(t => !!t);
            await this.sendPushNotification(tokens, title, message);
        } catch (error) {
            console.error("Error sending push notifications to all:", error);
        }
    }

    async getAllNotifications(page?: number, limit?: number, employeeId?: number): Promise<ApiResponse<Notification[]>> {
        const queryBuilder = this.notificationRepository.createQueryBuilder("notification")
            .leftJoinAndSelect("notification.employee", "employee")
            .where("notification.status != :status", { status: StatusEnum.Deactivate });

        if (employeeId) {
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where("employee.id = :empId", { empId: employeeId })
                  .orWhere("notification.employeeId IS NULL");
            }));
        }

        queryBuilder.orderBy("notification.order", "ASC")
                    .addOrderBy("notification.createdAt", "DESC");

        if (page !== undefined && limit !== undefined) {
            queryBuilder.skip((page - 1) * limit);
            queryBuilder.take(limit);
        }

        const [notifications, total] = await queryBuilder.getManyAndCount();

        if (page !== undefined && limit !== undefined) {
            const lastPage = Math.ceil(total / limit);
            return new ApiResponse(statusCode.OK, notifications, "Notifications retrieved successfully", page, total, lastPage);
        } else {
            return new ApiResponse(statusCode.OK, notifications, "Notifications retrieved successfully", undefined, total);
        }
    }

    async getNotificationById(id: number): Promise<ApiResponse<Notification>> {
        const notification = await this.notificationRepository.findOne({ 
            where: { id, status: Not(StatusEnum.Deactivate) },
            relations: ["employee"]
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

        const { employeeId, ...notifData } = data;
        if (employeeId) {
            const employee = await this.employeeRepository.findOneBy({ id: employeeId });
            if (employee) notification.employee = employee;
        } else if (employeeId === null) {
            notification.employee = null as any;
        }

        Object.assign(notification, notifData);
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
