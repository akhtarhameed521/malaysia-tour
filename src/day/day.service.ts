import AppDataSource from "../config/db-config";
import { Day } from "./entities/day.entity";
import { CreateDayDto, UpdateDayDto } from "./dto/day.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class DayService {
    private dayRepository = AppDataSource.getRepository(Day);

    async createDay(data: CreateDayDto): Promise<ApiResponse<Day>> {
        const day = this.dayRepository.create(data);
        await this.dayRepository.save(day);
        return new ApiResponse(statusCode.Created, day, "Day created successfully");
    }

    async getAllDays(): Promise<ApiResponse<Day[]>> {
        const days = await this.dayRepository.find({
            relations: ["sessions"]
        });
        return new ApiResponse(statusCode.OK, days, "Days retrieved successfully");
    }

    async getDayById(id: number): Promise<ApiResponse<Day>> {
        const day = await this.dayRepository.findOne({
            where: { id },
            relations: ["sessions"]
        });
        if (!day) throw new ApiError(statusCode.NotFound, "Day not found");
        return new ApiResponse(statusCode.OK, day, "Day retrieved successfully");
    }

    async updateDay(id: number, data: UpdateDayDto): Promise<ApiResponse<Day>> {
        const day = await this.dayRepository.findOneBy({ id });
        if (!day) throw new ApiError(statusCode.NotFound, "Day not found");

        Object.assign(day, data);
        await this.dayRepository.save(day);
        return new ApiResponse(statusCode.OK, day, "Day updated successfully");
    }

    async deleteDay(id: number): Promise<ApiResponse<null>> {
        const result = await this.dayRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Day not found");
        return new ApiResponse(statusCode.OK, null, "Day deleted successfully");
    }
}
