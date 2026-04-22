import AppDataSource from "../config/db-config";
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

    async deleteSession(id: number): Promise<ApiResponse<null>> {
        const result = await this.sessionRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Session not found");
        return new ApiResponse(statusCode.OK, null, "Session deleted successfully");
    }
}
