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
            const targetTimeZone = process.env.TIMEZONE || "Asia/Kuala_Lumpur"; 
            const nowInTZ = new Date(new Date().toLocaleString("en-US", { timeZone: targetTimeZone }));
            
            const sessionRepository = AppDataSource.getRepository(Session);
            const employeeRepository = AppDataSource.getRepository(EmployeeEntity);
            const notificationRepository = AppDataSource.getRepository(Notification);

            // Time offsets to check: 0 minutes (starting now) and 15 minutes (reminder)
            const checkPoints = [
                { offset: 0, titlePrefix: "Session Starting Now", messageSuffix: "is starting now", type: "session_start" },
                { offset: 15, titlePrefix: "Session Reminder", messageSuffix: "starts in 15 minutes", type: "session_reminder" }
            ];

            for (const cp of checkPoints) {
                const checkTime = new Date(nowInTZ.getTime() + cp.offset * 60000);
                
                const year = checkTime.getFullYear();
                const month = String(checkTime.getMonth() + 1).padStart(2, "0");
                const day = String(checkTime.getDate()).padStart(2, "0");

                const hours = String(checkTime.getHours()).padStart(2, "0");
                const minutes = String(checkTime.getMinutes()).padStart(2, "0");

                const dateStr = `${year}-${month}-${day}`;
                const timeStr = `${hours}:${minutes}`;

                // console.log(`[Session Cron] Checking for sessions starting at ${dateStr} ${timeStr} (${cp.offset} min offset)`);

                // Fetch sessions matching the calculated time
                const sessions = await sessionRepository.createQueryBuilder("session")
                    .leftJoinAndSelect("session.groups", "group")
                    .where("session.date = :date", { date: dateStr })
                    .andWhere("EXTRACT(HOUR FROM session.time) = :hours", { hours: parseInt(hours) })
                    .andWhere("EXTRACT(MINUTE FROM session.time) = :minutes", { minutes: parseInt(minutes) })
                    .getMany();

                if (sessions.length > 0) {
                    console.log(`[Session Cron] Found ${sessions.length} sessions for ${cp.type} (${timeStr}).`);
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
                        const sessionTitle = session.sessionTitle;
                        const titleText = sessionTitle || "Upcoming Session";
                        const title = `${cp.titlePrefix}: ${titleText}`;
                        const locationStr = session.location ? ` at ${session.location}` : "";
                        
                        const message = sessionTitle 
                            ? `Your session "${sessionTitle}" ${cp.messageSuffix}${locationStr}.`
                            : `Your upcoming session ${cp.messageSuffix}${locationStr}.`;

                        console.log(`[Session Cron] Sending ${cp.type} for "${titleText}" to ${uniqueEmployees.length} employees.`);

                        // 1. Create DB records for Notifications
                        const notificationsToSave = uniqueEmployees.map(emp => {
                            return notificationRepository.create({
                                title,
                                message,
                                type: cp.type as any,
                                employee: emp
                            });
                        });
                        await notificationRepository.save(notificationsToSave);

                        // 2. Send Multicast Push
                        const tokens = uniqueEmployees.map(e => e.fcmToken).filter(token => !!token);

                        if (tokens.length > 0) {
                            const payload = {
                                notification: { title, body: message },
                                data: { click_action: "FLUTTER_NOTIFICATION_CLICK", type: cp.type, sessionId: session.id.toString() }
                            };

                            try {
                                const response = await admin.messaging().sendEachForMulticast({
                                    tokens: tokens as string[],
                                    notification: payload.notification,
                                    data: payload.data
                                });
                                console.log(`Successfully sent ${response.successCount} ${cp.type} push notifications.`);
                            } catch (error) {
                                console.error(`Error sending ${cp.type} push notifications:`, error);
                            }
                        }
                    }
                }
            }

            // --- Airline Departure Reminder (6 hours before) ---
            const airlineNow = new Date(new Date().toLocaleString("en-US", { timeZone: targetTimeZone }));
            airlineNow.setHours(airlineNow.getHours() + 6);
            
            const aYear = airlineNow.getFullYear();
            const aMonth = String(airlineNow.getMonth() + 1).padStart(2, "0");
            const aDay = String(airlineNow.getDate()).padStart(2, "0");
            const aHours = String(airlineNow.getHours()).padStart(2, "0");
            const aMinutes = String(airlineNow.getMinutes()).padStart(2, "0");

            const aDateStr = `${aYear}-${aMonth}-${aDay}`;
            const aTimeStr = `${aHours}:${aMinutes}`;

            // 1. Check Departure Airline
            const departureEmployees = await employeeRepository.find({
                where: {
                    airline: Raw((alias) => `(${alias} ->> 'departureDate') = :date AND (${alias} ->> 'departureTime') LIKE :time`, { 
                        date: aDateStr, 
                        time: `${aTimeStr}%` 
                    })
                }
            });

            // 2. Check Return Airline
            const returnEmployees = await employeeRepository.find({
                where: {
                    returnAirline: Raw((alias) => `(${alias} ->> 'departureDate') = :date AND (${alias} ->> 'departureTime') LIKE :time`, { 
                        date: aDateStr, 
                        time: `${aTimeStr}%` 
                    })
                }
            });

            const allAirlineEmployees = [...departureEmployees, ...returnEmployees];

            if (allAirlineEmployees.length > 0) {
                console.log(`[Airline Cron] Found ${allAirlineEmployees.length} employees for flight departure reminders.`);
                
                for (const emp of allAirlineEmployees) {
                    const isReturn = returnEmployees.some(re => re.id === emp.id);
                    const airlineInfo = isReturn ? emp.returnAirline : emp.airline;
                    
                    const title = `Flight Departure Reminder`;
                    const message = `Your ${isReturn ? "return " : ""}flight ${airlineInfo.name} is departing in 6 hours at ${airlineInfo.departureTime}. Please ensure you are ready.`;

                    // Save notification to DB
                    await notificationRepository.save(notificationRepository.create({
                        title,
                        message,
                        type: "airline_reminder",
                        employee: emp
                    }));

                    // Send Push
                    if (emp.fcmToken) {
                        try {
                            await admin.messaging().send({
                                token: emp.fcmToken,
                                notification: { title, body: message },
                                data: { click_action: "FLUTTER_NOTIFICATION_CLICK", type: "airline_reminder" }
                            });
                            console.log(`[Airline Cron] Sent departure reminder to employee: ${emp.fullName || emp.id}`);
                        } catch (error) {
                            console.error(`[Airline Cron] Error sending push to employee ${emp.id}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in session cron job:", error);
        }
    });
};
