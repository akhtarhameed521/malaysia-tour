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

    async getAllSessions(groupId?: number, page?: number, limit?: number): Promise<ApiResponse<Session[]>> {
        const query: any = {
            relations: ["groups"],
            order: { date: "ASC", time: "ASC" }
        };

        if (groupId) {
            query.where = {
                groups: { id: groupId }
            };
        }

        if (page !== undefined && limit !== undefined) {
            query.skip = (page - 1) * limit;
            query.take = limit;
        }

        const [sessions, total] = await this.sessionRepository.findAndCount(query);

        if (page !== undefined && limit !== undefined) {
            const lastPage = Math.ceil(total / limit);
            return new ApiResponse(statusCode.OK, sessions, "Sessions retrieved successfully", page, total, lastPage);
        } else {
            return new ApiResponse(statusCode.OK, sessions, "Sessions retrieved successfully", undefined, total);
        }
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

    // Fetch all groups to match airlineName with group name
    const allGroups = await this.groupRepository.find();
    const groupMap = new Map(allGroups.map(g => [g.name.toLowerCase().trim(), g]));

    let createdCount = 0;

    for (const row of data as any[]) {
        // Normalize keys: lowercase + trim
        const normRow: any = {};
        for (const key of Object.keys(row)) {
            normRow[key.toLowerCase().trim()] = row[key];
        }

        const sessionTitle = normRow['sessiontitle'] ?? null;

        // Skip completely empty or header-only rows
        if (!sessionTitle) continue;

        const rawDate    = normRow['date']     ?? null;
        const rawTime    = normRow['time']     ?? null;
        const location   = normRow['location'] ?? null;
        const speaker    = normRow['speaker']  ?? null;
        const track      = normRow['track']    ?? null;
        const airlineName = normRow['airlinename'] ?? null;

        // Group ID column header: "groupId (Select from Group Tab)"
        const groupIds =
            normRow['groupid (select from group tab)'] ??
            normRow['groupids'] ??
            normRow['groupid']  ??
            null;

        // Parse group IDs
        let gIds: number[] = [];
        if (groupIds !== undefined && groupIds !== null) {
            if (typeof groupIds === 'number') {
                gIds = [groupIds];
            } else if (typeof groupIds === 'string') {
                try {
                    const cleaned = groupIds.replace(/'/g, '"');
                    const parsed = JSON.parse(cleaned);
                    gIds = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
                } catch {
                    gIds = groupIds.split(',').map((s: string) => Number(s.trim()));
                }
            }
        }
        gIds = gIds.filter(n => !isNaN(n));

        // If no groupIds provided but airlineName exists, try to match by group name
        if (gIds.length === 0 && airlineName) {
            const matchedGroup = groupMap.get(airlineName.toLowerCase().trim());
            if (matchedGroup) {
                gIds = [matchedGroup.id];
            }
        }

        const groups = gIds.length > 0
            ? await this.groupRepository.find({ where: { id: In(gIds) } })
            : [];

        const session = this.sessionRepository.create({
            sessionTitle,
            date:      this.formatDate(rawDate),   // null-safe
            time:      this.formatTime(rawTime),   // null-safe
            location:  location || null,
            speaker:   speaker  || null,
            track:     track    || null,
            airlineName: airlineName || null,
        });

        if (groups.length > 0) {
            session.groups = groups;
        }

        await this.sessionRepository.save(session);
        createdCount++;

        if (gIds.length > 0) {
            await this.updateEmployeeSessions(gIds, session);
        }

        if (airlineName) {
            await this.updateEmployeeSessionsByAirline(airlineName, session);
        }
    }

    return new ApiResponse(statusCode.Created, { createdCount }, "Sessions bulk uploaded successfully");
}

private formatDate(dateInput: any): string | null {
    // Return null for empty/missing — Postgres accepts NULL for nullable date column
    if (dateInput === undefined || dateInput === null) return null;

    if (dateInput instanceof Date) {
        return dateInput.toISOString().split('T')[0];
    }

    const num = Number(dateInput);
    if (!isNaN(num) && num > 1) {
        // Excel serial date → JS Date (1 = 1900-01-01)
        const date = new Date(Math.round((num - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }

    const s = String(dateInput).trim();
    if (!s || s.toLowerCase() === 'nan') return null;

    // Human-readable strings like "2nd May" → parse manually
    const cleaned = s.replace(/(\d+)(st|nd|rd|th)/i, '$1'); // "2nd May" → "2 May"
    const parsed = new Date(`${cleaned} 2025`);              // assume current event year
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }

    return null; // unrecognised format — store as null rather than crash
}

private formatTime(timeInput: any): string | null {
    // Return null for empty/missing — Postgres accepts NULL for nullable time column
    if (timeInput === undefined || timeInput === null) return null;

    if (timeInput instanceof Date) {
        // xlsx with cellDates:true gives us a Date object for time cells
        const h = timeInput.getHours().toString().padStart(2, '0');
        const m = timeInput.getMinutes().toString().padStart(2, '0');
        const s = timeInput.getSeconds().toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    const num = Number(timeInput);
    if (!isNaN(num) && num >= 0 && num < 1) {
        // Excel fractional day → HH:MM:SS
        const totalSeconds = Math.round(num * 86400);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    const str = String(timeInput).trim();
    if (!str || str.toLowerCase() === 'nan') return null;

    // Already a valid HH:MM or HH:MM:SS string
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) return str;

    return null;
}
}
