import AppDataSource from "../config/db-config";
import * as xlsx from 'xlsx';
import { Session } from "./entities/session.entity";
import { GroupEntity } from "../group/entities/group.entity";
import { EmployeeEntity } from "../entities/employee.entity";
import { CreateSessionDto, UpdateSessionDto } from "./dto/session.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { In, Raw } from "typeorm";

export class SessionService {
    private sessionRepository = AppDataSource.getRepository(Session);
    private groupRepository = AppDataSource.getRepository(GroupEntity);
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);

    private async updateEmployeeSessions(groupIds: number[], session: Session) {
        const sessionObj = {
            id: session.id,
            sessionTitle: session.sessionTitle,
            time: session.time,
            date: session.date,
            location: session.location,
            speaker: session.speaker,
            track: session.track
        };

        for (const gId of groupIds) {
            const employees = await this.employeeRepository.find({
                where: {
                    group: Raw((alias) => `${alias} ->> 'id' = :gId`, { gId: gId.toString() })
                }
            });

            for (const employee of employees) {
                if (!employee.sessions) employee.sessions = [];
                
                // Check if session already exists in employee's sessions to avoid duplicates
                const sessionExists = employee.sessions.find(s => s.id === session.id);
                if (!sessionExists) {
                    employee.sessions.push(sessionObj);
                } else {
                    // Update existing session info in employee data
                    const index = employee.sessions.findIndex(s => s.id === session.id);
                    employee.sessions[index] = sessionObj;
                }
                
                await this.employeeRepository.save(employee);
            }
        }
    }

    private async updateEmployeeSessionsByAirline(airlineName: string, session: Session) {
        if (!airlineName) return;

        const sessionObj = {
            id: session.id,
            sessionTitle: session.sessionTitle,
            time: session.time,
            date: session.date,
            location: session.location,
            speaker: session.speaker,
            track: session.track
        };

        // Find employees where airline name matches (case-insensitive partial match to handle variations like "Qatar" vs "Qatar Airways")
        const employees = await this.employeeRepository.find({
            where: {
                airline: Raw((alias) => `LOWER(${alias} ->> 'name') LIKE LOWER(:airlineName)`, { airlineName: `%${airlineName}%` })
            }
        });

        for (const employee of employees) {
            if (!employee.sessions) employee.sessions = [];
            
            const sessionExists = employee.sessions.find(s => s.id === session.id);
            if (!sessionExists) {
                employee.sessions.push(sessionObj);
            } else {
                const index = employee.sessions.findIndex(s => s.id === session.id);
                employee.sessions[index] = sessionObj;
            }
            
            await this.employeeRepository.save(employee);
        }
    }

    async createSession(data: CreateSessionDto): Promise<ApiResponse<Session>> {
        const { groupIds, ...sessionData } = data;
        
        if (groupIds && groupIds.length > 0) {
            const groups = await this.groupRepository.findBy({ id: In(groupIds) });
            if (groups.length !== groupIds.length) {
                const foundIds = groups.map(g => g.id);
                const missingIds = groupIds.filter(id => !foundIds.includes(id));
                throw new ApiError(statusCode.BadRequest, `Group IDs ${missingIds.join(", ")} do not exist`);
            }
        }

        const session = this.sessionRepository.create(sessionData);

        if (groupIds && groupIds.length > 0) {
            session.groups = await this.groupRepository.findBy({ id: In(groupIds) });
        }

        await this.sessionRepository.save(session);

        if (groupIds && groupIds.length > 0) {
            await this.updateEmployeeSessions(groupIds, session);
        }

        return new ApiResponse(statusCode.Created, session, "Session created successfully");
    }

    async getAllSessions(): Promise<ApiResponse<Session[]>> {
        const sessions = await this.sessionRepository.find({
            relations: ["groups"]
        });
        return new ApiResponse(statusCode.OK, sessions, "Sessions retrieved successfully");
    }

    async getSessionById(id: number): Promise<ApiResponse<Session>> {
        const session = await this.sessionRepository.findOne({
            where: { id },
            relations: ["groups"]
        });
        if (!session) throw new ApiError(statusCode.NotFound, "Session not found");
        return new ApiResponse(statusCode.OK, session, "Session retrieved successfully");
    }

    async updateSession(id: number, data: UpdateSessionDto): Promise<ApiResponse<Session>> {
        const session = await this.sessionRepository.findOne({
            where: { id },
            relations: ["groups"]
        });
        if (!session) throw new ApiError(statusCode.NotFound, "Session not found");

        const { groupIds, ...sessionData } = data;

        if (groupIds && groupIds.length > 0) {
            const groups = await this.groupRepository.findBy({ id: In(groupIds) });
            if (groups.length !== groupIds.length) {
                const foundIds = groups.map(g => g.id);
                const missingIds = groupIds.filter(id => !foundIds.includes(id));
                throw new ApiError(statusCode.BadRequest, `Group IDs ${missingIds.join(", ")} do not exist`);
            }
            session.groups = groups;
        }

        Object.assign(session, sessionData);
        await this.sessionRepository.save(session);

        if (groupIds && groupIds.length > 0) {
            await this.updateEmployeeSessions(groupIds, session);
        }

        return new ApiResponse(statusCode.OK, session, "Session updated successfully");
    }

    async getSessionsByEmployee(employeeId: string): Promise<ApiResponse<Session[]>> {
        const employee = await this.employeeRepository.findOneBy({ employeeId });
        if (!employee) throw new ApiError(statusCode.NotFound, "Employee not found");

        const groupId = employee.group?.id ? parseInt(employee.group.id) : null;
        const airlineName = employee.airline?.name;

        const sessions = await this.sessionRepository.find({
            where: [
                { groups: { id: groupId as number } },
                { airlineName: airlineName }
            ],
            relations: ["groups"]
        });

        return new ApiResponse(statusCode.OK, sessions, "User sessions retrieved successfully");
    }

    async deleteSession(id: number): Promise<ApiResponse<null>> {
        const result = await this.sessionRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Session not found");
        return new ApiResponse(statusCode.OK, null, "Session deleted successfully");
    }

    async bulkUploadSessions(filePath: string): Promise<ApiResponse<any>> {
        const workbook = xlsx.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        let createdCount = 0;

        for (const row of data as any[]) {
            // Normalize keys to lowercase and trim
            const normalizedRow: any = {};
            for (const key of Object.keys(row)) {
                normalizedRow[key.toLowerCase().trim()] = row[key];
            }

            const sessionTitle = normalizedRow['sessiontitle'];
            const date = normalizedRow['date'];
            const time = normalizedRow['time'];
            const location = normalizedRow['location'];
            const speaker = normalizedRow['speaker'];
            const track = normalizedRow['track'];
            const groupIds = normalizedRow['groupids'] || normalizedRow['groupsid'];

            // Handle group IDs from column
            let gIds: number[] = [];
            if (groupIds !== undefined && groupIds !== null) {
                if (typeof groupIds === 'number') {
                    gIds = [groupIds];
                } else if (typeof groupIds === 'string') {
                    try {
                        const cleaned = groupIds.replace(/'/g, '"');
                        const parsed = JSON.parse(cleaned);
                        gIds = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
                    } catch (e) {
                        gIds = groupIds.split(',').map((s: string) => Number(s.trim()));
                    }
                }
            }

            // Sanitize gIds: remove NaN and non-numbers
            gIds = gIds.filter(n => typeof n === 'number' && !isNaN(n));

            // Find groups by ID
            const groups = gIds.length > 0 ? await this.groupRepository.find({
                where: { id: In(gIds) }
            }) : [];

            const session = this.sessionRepository.create({
                sessionTitle,
                date: this.formatDate(date),
                time: this.formatTime(time),
                location,
                speaker: speaker || null,
                track: track || null,
                airlineName: null 
            });

            if (groups.length > 0) {
                session.groups = groups;
            }

            await this.sessionRepository.save(session);
            createdCount++;

            if (gIds.length > 0) {
                await this.updateEmployeeSessions(gIds, session);
            }
        }

        return new ApiResponse(statusCode.Created, { createdCount }, "Sessions bulk uploaded successfully");
    }

    private formatDate(dateInput: any): string {
        if (!dateInput) return "";

        if (dateInput instanceof Date) {
            return dateInput.toISOString().split('T')[0];
        }

        const num = Number(dateInput);
        if (!isNaN(num) && num > 0) {
            // Excel serial date to JS Date
            // 25569 is the number of days between 1/1/1900 and 1/1/1970
            const date = new Date(Math.round((num - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
        }

        return dateInput.toString();
    }

    private formatTime(timeInput: any): string {
        if (!timeInput) return "";

        if (timeInput instanceof Date) {
            const hours = timeInput.getHours().toString().padStart(2, '0');
            const minutes = timeInput.getMinutes().toString().padStart(2, '0');
            const seconds = timeInput.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        const num = Number(timeInput);
        if (!isNaN(num) && num >= 0 && num < 1) {
            // Excel time is a fraction of 24h
            const totalSeconds = Math.round(num * 24 * 3600);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        return timeInput.toString();
    }
}
