import AppDataSource from "../config/db-config";
import { Session } from "./entities/session.entity";
import { Day } from "../day/entities/day.entity";
import { CreateSessionDto, UpdateSessionDto } from "./dto/session.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class SessionService {
    private sessionRepository = AppDataSource.getRepository(Session);
    private dayRepository = AppDataSource.getRepository(Day);

    async createSession(data: CreateSessionDto): Promise<ApiResponse<Session>> {
        const day = await this.dayRepository.findOneBy({ id: data.dayId });
        if (!day) {
            throw new ApiError(statusCode.NotFound, "Day not found");
        }

        const session = this.sessionRepository.create(data);
        await this.sessionRepository.save(session);
        return new ApiResponse(statusCode.Created, session, "Session created successfully");
    }

    async getAllSessions(): Promise<ApiResponse<Session[]>> {
        const sessions = await this.sessionRepository.find({
            relations: ["day"]
        });
        return new ApiResponse(statusCode.OK, sessions, "Sessions retrieved successfully");
    }

    async getSessionById(id: number): Promise<ApiResponse<Session>> {
        const session = await this.sessionRepository.findOne({
            where: { id },
            relations: ["day"]
        });
        if (!session) throw new ApiError(statusCode.NotFound, "Session not found");
        return new ApiResponse(statusCode.OK, session, "Session retrieved successfully");
    }

    async updateSession(id: number, data: UpdateSessionDto): Promise<ApiResponse<Session>> {
        const session = await this.sessionRepository.findOneBy({ id });
        if (!session) throw new ApiError(statusCode.NotFound, "Session not found");

        if (data.dayId) {
            const day = await this.dayRepository.findOneBy({ id: data.dayId });
            if (!day) throw new ApiError(statusCode.NotFound, "Day not found");
            session.day = day;
        }

        Object.assign(session, data);
        await this.sessionRepository.save(session);
        return new ApiResponse(statusCode.OK, session, "Session updated successfully");
    }

    async deleteSession(id: number): Promise<ApiResponse<null>> {
        const result = await this.sessionRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Session not found");
        return new ApiResponse(statusCode.OK, null, "Session deleted successfully");
    }
}
