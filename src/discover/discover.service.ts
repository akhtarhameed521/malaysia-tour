import AppDataSource from "../config/db-config";
import { Explore } from "../explore/entities/explore.entity";
import { SafetyEntity } from "../safety/entities/safety.entity";
import { ApiResponse } from "../common/helper/api-success.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { ExploreType, SafetyType } from "../types";

export class DiscoverService {
    private exploreRepository = AppDataSource.getRepository(Explore);
    private safetyRepository = AppDataSource.getRepository(SafetyEntity);

    async getDiscoverData(): Promise<ApiResponse<any>> {
        const [explores, safeties] = await Promise.all([
            this.exploreRepository.find({ order: { createdAt: "DESC" } }),
            this.safetyRepository.find({ order: { createdAt: "DESC" } })
        ]);

        const response: any = {
            dos: safeties.filter(s => s.type === SafetyType.Do),
            donts: safeties.filter(s => s.type === SafetyType.Dont),
            emergencyContacts: safeties.filter(s => s.type === SafetyType.EmergencyContact).map(s => ({
                id: s.id,
                title: s.title,
                description: s.phoneNumber 
            })),
            healthNotices: safeties.filter(s => s.type === SafetyType.HealthNotice).map(s => ({
                id: s.id,
                description: s.description,
                phoneNumber: s.phoneNumber
            })),
            generalSafety: safeties.filter(s => s.type === SafetyType.GeneralSafety),
            explores: {
                PlaceToVisit: explores.filter(e => e.type === ExploreType.PlaceToVisit),
                Foods: explores.filter(e => e.type === ExploreType.Food),
                gettingAround: explores.filter(e => e.type === ExploreType.GettingAround)
            }
        };

        return new ApiResponse(statusCode.OK, response, "Discovery data retrieved successfully");
    }
}
