import AppDataSource from "../config/db-config";
import { UserEntity } from "../user/entities/user.entity";
import { EmployeeEntity } from "../entities/employee.entity";
import { LoginUserDto, ChangePasswordDto, RegisterUserDto } from "./dto/auth.dto";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { ApiResponse } from "../common/helper/api-success.helper";
import * as bcrypt from "bcrypt";
import { jwtSign, hashPassword } from "../common/helper/auth.helper";
import { CreateEmployeeDto } from "./dto/auth.dto";
import { uploadCloudinary } from "../common/provider/cloudinary.provider";

export class AuthService {
    private userRepository = AppDataSource.getRepository(UserEntity);

    async createEmployee(data: CreateEmployeeDto): Promise<ApiResponse<any>> {
        const employeeRepository = AppDataSource.getRepository(EmployeeEntity);
        
       
        const employee = await employeeRepository.findOneBy({ employeeId: data.employeeId });
        if (!employee) {
            throw new ApiError(statusCode.NotFound, "Employee not found in master data");
        }

        
        let user = await this.userRepository.findOneBy({ employeeId: data.employeeId });
        if (user) {
            return new ApiResponse(statusCode.OK, { user, employee }, "Employee already exists as a user");
        }

        
        user = this.userRepository.create({ employeeId: data.employeeId });
        await this.userRepository.save(user);

        return new ApiResponse(statusCode.Created, { user, employee }, "Employee found and user initialized successfully");
    }

    async registerUser(data: RegisterUserDto, imagePath?: string): Promise<ApiResponse<any>> {
        const employeeRepository = AppDataSource.getRepository(EmployeeEntity);
        
        // 1. Check if employee exists in master table
        const employeeRecord = await employeeRepository.findOneBy({ employeeId: data.employeeId });
        if (!employeeRecord) {
            throw new ApiError(statusCode.NotFound, "Employee ID not found in master data");
        }

        // 2. Check if a user account is already created for this employee
        const existingUser = await this.userRepository.findOneBy({ employeeId: data.employeeId });
        if (existingUser && existingUser.password) {
            throw new ApiError(statusCode.BadRequest, "User account already registered for this Employee ID");
        }

        let imageUrl = "";
        if (imagePath) {
            const uploadResult = await uploadCloudinary(imagePath);
            if (uploadResult) {
                imageUrl = uploadResult.secure_url;
            }
        }

        const hashedPassword = await hashPassword(data.password, 10);

        // 3. Insert or Update user using QueryBuilder
        // If createEmployee was called before, a shell user might exist. We use upsert or check.
        let userId: number;

        if (existingUser) {
            // Update the shell user
            await this.userRepository.createQueryBuilder()
                .update(UserEntity)
                .set({
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    password: hashedPassword,
                    image: imageUrl
                })
                .where("id = :id", { id: existingUser.id })
                .execute();
            userId = existingUser.id;
        } else {
            // Insert new user
            const insertResult = await this.userRepository.createQueryBuilder()
                .insert()
                .into(UserEntity)
                .values({
                    employeeId: data.employeeId,
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    password: hashedPassword,
                    image: imageUrl
                })
                .returning('*')
                .execute();
            userId = insertResult.raw[0].id;
        }

        // 4. Select the user using QueryBuilder to ensure we can control fields (and avoid password)
        const userResponse = await this.userRepository.createQueryBuilder("user")
            .select([
                "user.id",
                "user.fullName",
                "user.email",
                "user.phone",
                "user.image",
                "user.employeeId",
                "user.status",
                "user.createdAt",
                "user.updatedAt"
            ])
            .where("user.id = :id", { id: userId })
            .getOne();

        return new ApiResponse(statusCode.Created, userResponse, "User registered successfully");
    }

    async loginUser(data: LoginUserDto): Promise<ApiResponse<any>> {
        const { email, password } = data;

        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new ApiError(statusCode.NotFound, "User not found with this Employee ID");
        }

        if (!user.password) {
            throw new ApiError(statusCode.BadRequest, "Password not set for this account");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(statusCode.UnAuthorized, "Invalid password");
        }

        const token = jwtSign(user.id, user.employeeId, user.fullName);

        // Sanitize response
        const { password: _, ...userResponse } = user;

        return new ApiResponse(statusCode.OK, { user: userResponse, token }, "User logged in successfully");
    }

    async changePassword(data: ChangePasswordDto): Promise<ApiResponse<any>> {
        const { userId, newPassword } = data;

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(statusCode.NotFound, "User not found");
        }

        const hashedPassword = await hashPassword(newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);

        return new ApiResponse(statusCode.OK, null, "Password changed successfully");
    }
}
