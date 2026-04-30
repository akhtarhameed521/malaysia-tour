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
            // Get current time in the target timezone
            const targetTimeZone = process.env.TIMEZONE || "Asia/Karachi"; 
            const nowInTZ = new Date(new Date().toLocaleString("en-US", { timeZone: targetTimeZone }));
            
            const now = nowInTZ;
            // Add 5 minutes to current time
            now.setMinutes(now.getMinutes() + 5);

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");

            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");

            const dateStr = `${year}-${month}-${day}`;
            const timeStr = `${hours}:${minutes}`;

            console.log(`[Session Cron] Checking for sessions starting at ${dateStr} ${timeStr} (5-minute reminder)`);

            const sessionRepository = AppDataSource.getRepository(Session);
            const employeeRepository = AppDataSource.getRepository(EmployeeEntity);
            const notificationRepository = AppDataSource.getRepository(Notification);

            // Fetch sessions exactly matching the time
            const sessions = await sessionRepository.createQueryBuilder("session")
                .leftJoinAndSelect("session.groups", "group")
                .where("session.date = :date", { date: dateStr })
                .andWhere("EXTRACT(HOUR FROM session.time) = :hours", { hours: parseInt(hours) })
                .andWhere("EXTRACT(MINUTE FROM session.time) = :minutes", { minutes: parseInt(minutes) })
                .getMany();

            if (sessions.length > 0) {
                console.log(`[Session Cron] Found ${sessions.length} sessions matching criteria.`);
            }

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

                // Remove duplicates by employee ID
                const uniqueEmployeesMap = new Map<number, EmployeeEntity>();
                for (const emp of targetEmployees) {
                    uniqueEmployeesMap.set(emp.id, emp);
                }
                const uniqueEmployees = Array.from(uniqueEmployeesMap.values());

                if (uniqueEmployees.length > 0) {
                    const title = `Session Reminder: ${session.sessionTitle}`;
                    const message = `Your session "${session.sessionTitle}" is starting in 5 minutes at ${session.location}.`;

                    console.log(`[Session Cron] Sending reminder for "${session.sessionTitle}" to ${uniqueEmployees.length} unique employees.`);

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
