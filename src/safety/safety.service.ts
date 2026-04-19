import AppDataSource from "../config/db-config";
import { SafetyEntity } from "./entities/safety.entity";
import { CreateSafetyDto, UpdateSafetyDto } from "./dto/safety.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { SafetyType } from "../types";

export class SafetyService {
    private safetyRepository = AppDataSource.getRepository(SafetyEntity);

    private validatePhoneNumber(type: SafetyType, phoneNumber?: string | null) {
        const isEmergency = type === SafetyType.EmergencyContact || type === SafetyType.HealthNotice;
        
        if (isEmergency && !phoneNumber) {
            throw new ApiError(statusCode.BadRequest, "Phone number is required for Emergency Contact or Health Notice");
        }

        if (!isEmergency && phoneNumber) {
            throw new ApiError(statusCode.BadRequest, `Phone number should not be provided for ${type}`);
        }
    }

    private sanitize(entry: SafetyEntity) {
        const plainEntry = { ...entry };
        if (
            plainEntry.type === SafetyType.Do || 
            plainEntry.type === SafetyType.Dont || 
            plainEntry.type === SafetyType.GeneralSafety
        ) {
            delete (plainEntry as any).phoneNumber;
        }
        return plainEntry;
    }

    async createSafety(data: CreateSafetyDto): Promise<ApiResponse<any>> {
        this.validatePhoneNumber(data.type, data.phoneNumber);

        const safety = this.safetyRepository.create(data);
        await this.safetyRepository.save(safety);
        return new ApiResponse(statusCode.Created, this.sanitize(safety), "Safety entry created successfully");
    }

    async getAllSafety(type?: SafetyType): Promise<ApiResponse<any[]>> {
        const query: any = {};
        if (type) query.type = type;

        const entries = await this.safetyRepository.find({
            where: query,
            order: { createdAt: "DESC" }
        });
        const sanitizedEntries = entries.map(entry => this.sanitize(entry));
        return new ApiResponse(statusCode.OK, sanitizedEntries, "Safety entries retrieved successfully");
    }

    async getSafetyById(id: number): Promise<ApiResponse<any>> {
        const entry = await this.safetyRepository.findOneBy({ id });
        if (!entry) throw new ApiError(statusCode.NotFound, "Safety entry not found");
        return new ApiResponse(statusCode.OK, this.sanitize(entry), "Safety entry retrieved successfully");
    }

    async updateSafety(id: number, data: UpdateSafetyDto): Promise<ApiResponse<any>> {
        const entry = await this.safetyRepository.findOneBy({ id });
        if (!entry) throw new ApiError(statusCode.NotFound, "Safety entry not found");

        // If type is being updated, re-validate phone number
        const finalType = data.type || entry.type;
        const finalPhone = data.phoneNumber === undefined ? entry.phoneNumber : data.phoneNumber;
        this.validatePhoneNumber(finalType, finalPhone);

        Object.assign(entry, data);
        await this.safetyRepository.save(entry);
        return new ApiResponse(statusCode.OK, this.sanitize(entry), "Safety entry updated successfully");
    }

    async deleteSafety(id: number): Promise<ApiResponse<null>> {
        const result = await this.safetyRepository.delete(id);
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Safety entry not found");
        return new ApiResponse(statusCode.OK, null, "Safety entry deleted successfully");
    }
}
