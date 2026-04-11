import AppDataSource from "../config/db-config";
import { UserEntity } from "./entities/user.entity";
import { UpdateUserDto,  AddUserDetailsDto } from "./dto/user.dto";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { ApiResponse } from "../common/helper/api-success.helper";
import { StatusEnum } from "../types";
import { Not } from "typeorm";
import { hashPassword } from "../common/helper/auth.helper";

export class UserService {
    private userRepository = AppDataSource.getRepository(UserEntity);

    async getAllUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<UserEntity[]>> {
        const [users, total] = await this.userRepository.findAndCount({
            where: {
                status: Not(StatusEnum.Deactivate)
            },
            select: {
                id: true,
                employeeId: true,
                fullName: true,
                email: true,
                phone: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit
        });
        const lastPage = Math.ceil(total / limit);
        return new ApiResponse(statusCode.OK, users, "Users retrieved successfully", page, total, lastPage);
    }

    async getUserById(id: number): Promise<ApiResponse<UserEntity>> {
        const user = await this.userRepository.findOne({
            where: {
                id,
                status: Not(StatusEnum.Deactivate)
            },
            select: {
                id: true,
                employeeId: true,
                fullName: true,
                email: true,
                phone: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new ApiError(statusCode.NotFound, "User not found");
        }

        return new ApiResponse(statusCode.OK, user, "User retrieved successfully");
    }

    async updateUser(id: number, data: UpdateUserDto): Promise<ApiResponse<UserEntity>> {
        const user = await this.userRepository.findOneBy({ id });

        if (!user || user.status === StatusEnum.Deactivate) {
            throw new ApiError(statusCode.NotFound, "User not found or deactivated");
        }

        if (data.fullName !== undefined) user.fullName = data.fullName;
        if (data.phone !== undefined) user.phone = data.phone;

        await this.userRepository.save(user);
        return new ApiResponse(statusCode.OK, user, "User updated successfully");
    }

    async deleteUser(id: number): Promise<ApiResponse<null>> {
        const user = await this.userRepository.findOneBy({ id });

        if (!user || user.status === StatusEnum.Deactivate) {
            throw new ApiError(statusCode.NotFound, "User not found or already deactivated");
        }

        user.status = StatusEnum.Deactivate;
        await this.userRepository.save(user);

        return new ApiResponse(statusCode.OK, null, "User deleted successfully");
    }

  

   
}
