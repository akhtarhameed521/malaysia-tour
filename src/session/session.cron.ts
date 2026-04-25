import cron from "node-cron";
import AppDataSource from "../config/db-config";
import { Session } from "./entities/session.entity";
import { Notification } from "../notification/entities/notification.entity";
import admin from "../common/config/firebase-keys.config";
import { EmployeeEntity } from "../entities/employee.entity";
import { Raw } from "typeorm";

export const startSessionCronJobs = () => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            // Add 5 minutes to current time
            now.setMinutes(now.getMinutes() + 5);

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");

            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");

            const dateStr = `${year}-${month}-${day}`;
            const timeStr = `${hours}:${minutes}`;

            const sessionRepository = AppDataSource.getRepository(Session);
            const employeeRepository = AppDataSource.getRepository(EmployeeEntity);
            const notificationRepository = AppDataSource.getRepository(Notification);

            // Fetch sessions exactly matching the time
            const sessions = await sessionRepository.createQueryBuilder("session")
                .leftJoinAndSelect("session.groups", "group")
                .where("session.date = :date", { date: dateStr })
                .andWhere("CAST(session.time AS text) LIKE :time", { time: `${timeStr}%` })
                .getMany();

            for (const session of sessions) {
                let targetEmployees: EmployeeEntity[] = [];

                // 1. Get employees by group
                if (session.groups && session.groups.length > 0) {
                    for (const group of session.groups) {
                        const employees = await employeeRepository.find({
                            where: {
                                group: Raw((alias) => `${alias} ->> 'id' = :gId`, { gId: group.id.toString() })
                            }
                        });
                        targetEmployees.push(...employees);
                    }
                }

                // 2. Get employees by airline
                if (session.airlineName) {
                    const employees = await employeeRepository.find({
                        where: {
                            airline: Raw((alias) => `LOWER(${alias} ->> 'name') LIKE LOWER(:airlineName)`, { airlineName: `%${session.airlineName}%` })
                        }
                    });
                    targetEmployees.push(...employees);
                }

                // Remove duplicates by employee ID
                const uniqueEmployeesMap = new Map<number, EmployeeEntity>();
                for (const emp of targetEmployees) {
                    uniqueEmployeesMap.set(emp.id, emp);
                }
                const uniqueEmployees = Array.from(uniqueEmployeesMap.values());

                if (uniqueEmployees.length > 0) {
                    const title = `Session Reminder: ${session.sessionTitle}`;
                    const message = `Your session "${session.sessionTitle}" is starting in 5 minutes at ${session.location}.`;

                    // 1. Create DB records for Notifications
                    const notificationsToSave = uniqueEmployees.map(emp => {
                        return notificationRepository.create({
                            title,
                            message,
                            type: "session_reminder",
                            employee: emp
                        });
                    });
                    await notificationRepository.save(notificationsToSave);

                    // 2. Send Multicast Push
                    const tokens = uniqueEmployees.map(e => e.fcmToken).filter(token => !!token);

                    if (tokens.length > 0) {
                        const payload = {
                            notification: { title, body: message },
                            data: { click_action: "FLUTTER_NOTIFICATION_CLICK", type: "session_reminder", sessionId: session.id.toString() }
                        };

                        try {
                            const response = await admin.messaging().sendEachForMulticast({
                                tokens: tokens as string[],
                                notification: payload.notification,
                                data: payload.data
                            });
                            console.log(`Successfully sent ${response.successCount} session reminder push notifications.`);
                        } catch (error) {
                            console.error("Error sending session reminder push notifications:", error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in session cron job:", error);
        }
    });
};
