import AppDataSource from "../config/db-config";
import { Explore } from "./entities/explore.entity";
import { CreateExploreDto, UpdateExploreDto } from "./dto/explore.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { ExploreType } from "../types";
import * as path from "path";

export class ExploreService {
    private exploreRepository = AppDataSource.getRepository(Explore);

    async createExplore(data: CreateExploreDto, imagePath?: string): Promise<ApiResponse<Explore>> {
        const baseUrl = process.env.BASE_URL;
        const imageUrl = imagePath ? `${baseUrl}/Uploads/${path.basename(imagePath)}` : (data.image || "");

        // Image check (common for all types based on your requirement)
        if (!imageUrl) {
            throw new ApiError(statusCode.BadRequest, "Image is required");
        }

        // Type-specific strict validation and filtering logic
        let filteredData: any = { type: data.type };
        const inputFields = Object.keys(data);

        if (data.type === ExploreType.PlaceToVisit) {
            const allowedFields = ["type", "title", "description", "tag", "location", "rating", "distance", "duration", "latitude", "longitude", "details", "image"];
            
            // Check for extra fields
            for (const field of inputFields) {
                if (!allowedFields.includes(field)) {
                    throw new ApiError(statusCode.BadRequest, `${field} is not allowed for Place to Visit`);
                }
            }

            const requiredFields = ["title", "description", "tag", "location", "rating", "distance", "duration", "latitude", "longitude"];
            for (const field of requiredFields) {
                const value = data[field as keyof CreateExploreDto];
                if (value === undefined || value === null || value === "") {
                    throw new ApiError(statusCode.BadRequest, `${field} is required for Place to Visit`);
                }
                filteredData[field] = value;
            }
            if (data.details) filteredData.details = data.details;
        } else if (data.type === ExploreType.Food) {
            const allowedFields = ["type", "title", "description", "tag", "details", "image"];
            
            // Check for extra fields
            for (const field of inputFields) {
                if (!allowedFields.includes(field)) {
                    throw new ApiError(statusCode.BadRequest, `${field} is not allowed for Food`);
                }
            }

            const requiredFields = ["title", "description", "tag"];
            for (const field of requiredFields) {
                const value = data[field as keyof CreateExploreDto];
                if (value === undefined || value === null || value === "") {
                    throw new ApiError(statusCode.BadRequest, `${field} is required for Food`);
                }
                filteredData[field] = value;
            }
            if (data.details) filteredData.details = data.details;
        } else if (data.type === ExploreType.GettingAround) {
            const allowedFields = ["type", "title", "description", "details", "image"];
            
            // Check for extra fields
            for (const field of inputFields) {
                if (!allowedFields.includes(field)) {
                    throw new ApiError(statusCode.BadRequest, `${field} is not allowed for Getting Around`);
                }
            }

            const requiredFields = ["title", "description"];
            for (const field of requiredFields) {
                const value = data[field as keyof CreateExploreDto];
                if (value === undefined || value === null || value === "") {
                    throw new ApiError(statusCode.BadRequest, `${field} is required for Getting Around`);
                }
                filteredData[field] = value;
            }
            if (data.details) filteredData.details = data.details;
        }

        const explore = this.exploreRepository.create({
            ...filteredData,
            image: imageUrl
        } as any) as unknown as Explore;
        await this.exploreRepository.save(explore);
        return new ApiResponse(statusCode.Created, explore, "Explore entry created successfully");
    }

    async getAllExplore(type?: ExploreType, page?: number, limit?: number): Promise<ApiResponse<Explore[]>> {
        const query: any = {};
        let select: any = undefined;

        if (type) {
            query.type = type;
            const commonFields = ["id", "status", "createdAt", "updatedAt", "type"];
            
            if (type === ExploreType.PlaceToVisit) {
                select = [...commonFields, "image", "title", "description", "tag", "location", "rating", "distance", "duration", "latitude", "longitude", "details"];
            } else if (type === ExploreType.Food) {
                select = [...commonFields, "image", "title", "description", "tag", "location", "rating", "distance", "duration", "latitude", "longitude", "details"];
            } else if (type === ExploreType.GettingAround) {
                select = [...commonFields, "image", "title", "description", "tag", "location", "rating", "distance", "duration", "latitude", "longitude", "details"];
            }
        }

        const findOptions: any = {
            where: query,
            select: select,
            order: { createdAt: "DESC" }
        };

        if (page !== undefined && limit !== undefined) {
            findOptions.skip = (page - 1) * limit;
            findOptions.take = limit;
        }

        const [entries, total] = await this.exploreRepository.findAndCount(findOptions);

        if (page !== undefined && limit !== undefined) {
            const lastPage = Math.ceil(total / limit);
            return new ApiResponse(statusCode.OK, entries, "Explore entries retrieved successfully", page, total, lastPage);
        } else {
            return new ApiResponse(statusCode.OK, entries, "Explore entries retrieved successfully", undefined, total);
        }
    }

    async getExploreById(id: number): Promise<ApiResponse<Explore>> {
        const entry = await this.exploreRepository.findOneBy({ id });
        if (!entry) {
            throw new ApiError(statusCode.NotFound, "Explore entry not found");
        }
        return new ApiResponse(statusCode.OK, entry, "Explore entry retrieved successfully");
    }

    async updateExplore(id: number, data: UpdateExploreDto, imagePath?: string): Promise<ApiResponse<Explore>> {
        const entry = await this.exploreRepository.findOneBy({ id });
        if (!entry) {
            throw new ApiError(statusCode.NotFound, "Explore entry not found");
        }

        const type = data.type || entry.type;
        let filteredData: any = {};
        const inputFields = Object.keys(data);

        if (type === ExploreType.PlaceToVisit) {
            const allowedFields = ["type", "title", "description", "tag", "location", "rating", "distance", "duration", "latitude", "longitude", "details", "image"];
            for (const field of inputFields) {
                if (!allowedFields.includes(field)) {
                    throw new ApiError(statusCode.BadRequest, `${field} is not allowed for Place to Visit`);
                }
                filteredData[field] = data[field as keyof UpdateExploreDto];
            }
        } else if (type === ExploreType.Food) {
            const allowedFields = ["type", "title", "description", "tag", "details", "image"];
            for (const field of inputFields) {
                if (!allowedFields.includes(field)) {
                    throw new ApiError(statusCode.BadRequest, `${field} is not allowed for Food`);
                }
                filteredData[field] = data[field as keyof UpdateExploreDto];
            }
        } else if (type === ExploreType.GettingAround) {
            const allowedFields = ["type", "title", "description", "details", "image"];
            for (const field of inputFields) {
                if (!allowedFields.includes(field)) {
                    throw new ApiError(statusCode.BadRequest, `${field} is not allowed for Getting Around`);
                }
                filteredData[field] = data[field as keyof UpdateExploreDto];
            }
        }

        const baseUrl = process.env.BASE_URL;
        const imageUrl = imagePath ? `${baseUrl}/Uploads/${path.basename(imagePath)}` : data.image;

        Object.assign(entry, {
            ...filteredData,
            ...(imageUrl ? { image: imageUrl } : {})
        });
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
