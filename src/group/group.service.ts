import AppDataSource from "../config/db-config";
import { GroupEntity } from "./entities/group.entity";
import { UserEntity } from "../user/entities/user.entity";
import { CreateGroupDto, UpdateGroupDto } from "./dto/group.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { In } from "typeorm";

export class GroupService {
    private groupRepository = AppDataSource.getRepository(GroupEntity);
    private userRepository = AppDataSource.getRepository(UserEntity);

    async createGroup(data: CreateGroupDto): Promise<ApiResponse<GroupEntity>> {
        const { userIds, ...groupData } = data;
        
        const group = this.groupRepository.create(groupData);

        if (userIds && userIds.length > 0) {
            const users = await this.userRepository.findBy({ id: In(userIds) });
            group.members = users;
        }

        await this.groupRepository.save(group);
        return new ApiResponse(statusCode.Created, group, "Group created successfully");
    }

    async getAllGroups(): Promise<ApiResponse<GroupEntity[]>> {
        const groups = await this.groupRepository.find({
            relations: {
                members: true
            }
        });
        return new ApiResponse(statusCode.OK, groups, "Groups retrieved successfully");
    }

    async getGroupById(id: number): Promise<ApiResponse<GroupEntity>> {
        const group = await this.groupRepository.findOne({
            where: { id },
            relations: {
                members: true
            }
        });
        if (!group) throw new ApiError(statusCode.NotFound, "Group not found");
        return new ApiResponse(statusCode.OK, group, "Group retrieved successfully");
    }

    async updateGroup(id: number, data: UpdateGroupDto): Promise<ApiResponse<GroupEntity>> {
        const group = await this.groupRepository.findOne({
            where: { id },
            relations: { members: true }
        });
        if (!group) throw new ApiError(statusCode.NotFound, "Group not found");

        const { userIds, ...groupData } = data;
        Object.assign(group, groupData);

        if (userIds !== undefined) {
            if (userIds.length > 0) {
                const users = await this.userRepository.findBy({ id: In(userIds) });
                group.members = users;
            } else {
                group.members = [];
            }
        }

        await this.groupRepository.save(group);
        return new ApiResponse(statusCode.OK, group, "Group updated successfully");
    }

    async deleteGroup(id: number): Promise<ApiResponse<null>> {
        const result = await this.groupRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Group not found");
        return new ApiResponse(statusCode.OK, null, "Group deleted successfully");
    }
}
