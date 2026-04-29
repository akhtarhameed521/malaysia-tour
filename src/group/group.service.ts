import AppDataSource from "../config/db-config";
import { GroupEntity } from "./entities/group.entity";
import { CreateGroupDto, UpdateGroupDto } from "./dto/group.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class GroupService {
    private groupRepository = AppDataSource.getRepository(GroupEntity);

    async createGroup(data: CreateGroupDto): Promise<ApiResponse<GroupEntity>> {
        const group = this.groupRepository.create(data);
        await this.groupRepository.save(group);
        return new ApiResponse(statusCode.Created, group, "Group created successfully");
    }

    async getAllGroups(page?: number, limit?: number): Promise<ApiResponse<GroupEntity[]>> {
        const findOptions: any = {
            order: { id: "ASC" }
        };

        if (page !== undefined && limit !== undefined) {
            findOptions.skip = (page - 1) * limit;
            findOptions.take = limit;
        }

        const [groups, total] = await this.groupRepository.findAndCount(findOptions);

        if (page !== undefined && limit !== undefined) {
            const lastPage = Math.ceil(total / limit);
            return new ApiResponse(statusCode.OK, groups, "Groups retrieved successfully", page, total, lastPage);
        } else {
            return new ApiResponse(statusCode.OK, groups, "Groups retrieved successfully", undefined, total);
        }
    }

    async getGroupById(id: number): Promise<ApiResponse<GroupEntity>> {
        const group = await this.groupRepository.findOne({
            where: { id },
        });
        if (!group) throw new ApiError(statusCode.NotFound, "Group not found");
        return new ApiResponse(statusCode.OK, group, "Group retrieved successfully");
    }

    async updateGroup(id: number, data: UpdateGroupDto): Promise<ApiResponse<GroupEntity>> {
        const group = await this.groupRepository.findOne({
            where: { id },
        });
        if (!group) throw new ApiError(statusCode.NotFound, "Group not found");

        Object.assign(group, data);

        await this.groupRepository.save(group);
        return new ApiResponse(statusCode.OK, group, "Group updated successfully");
    }

    async deleteGroup(id: number): Promise<ApiResponse<null>> {
        const result = await this.groupRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Group not found");
        return new ApiResponse(statusCode.OK, null, "Group deleted successfully");
    }
}
