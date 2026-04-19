import AppDataSource from "../config/db-config";
import { Explore } from "./entities/explore.entity";
import { CreateExploreDto, UpdateExploreDto } from "./dto/explore.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { ExploreType } from "../types";

export class ExploreService {
    private exploreRepository = AppDataSource.getRepository(Explore);

    async createExplore(data: CreateExploreDto): Promise<ApiResponse<Explore>> {
        const explore = this.exploreRepository.create(data);
        await this.exploreRepository.save(explore);
        return new ApiResponse(statusCode.Created, explore, "Explore entry created successfully");
    }

    async getAllExplore(type?: ExploreType): Promise<ApiResponse<Explore[]>> {
        const query: any = {};
        if (type) {
            query.type = type;
        }

        const entries = await this.exploreRepository.find({
            where: query,
            order: { createdAt: "DESC" }
        });

        return new ApiResponse(statusCode.OK, entries, "Explore entries retrieved successfully");
    }

    async getExploreById(id: number): Promise<ApiResponse<Explore>> {
        const entry = await this.exploreRepository.findOneBy({ id });
        if (!entry) {
            throw new ApiError(statusCode.NotFound, "Explore entry not found");
        }
        return new ApiResponse(statusCode.OK, entry, "Explore entry retrieved successfully");
    }

    async updateExplore(id: number, data: UpdateExploreDto): Promise<ApiResponse<Explore>> {
        const entry = await this.exploreRepository.findOneBy({ id });
        if (!entry) {
            throw new ApiError(statusCode.NotFound, "Explore entry not found");
        }

        Object.assign(entry, data);
        await this.exploreRepository.save(entry);
        return new ApiResponse(statusCode.OK, entry, "Explore entry updated successfully");
    }

    async deleteExplore(id: number): Promise<ApiResponse<null>> {
        const result = await this.exploreRepository.delete(id);
        if (result.affected === 0) {
            throw new ApiError(statusCode.NotFound, "Explore entry not found");
        }
        return new ApiResponse(statusCode.OK, null, "Explore entry deleted successfully");
    }
}
