import AppDataSource from "../config/db-config";
import { AdminEntity } from "./entities/admin.entity";
import { CreateAdminDto, UpdateAdminDto, LoginAdminDto } from "./dto/admin.dto";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { ApiResponse } from "../common/helper/api-success.helper";
import { hashPassword, jwtSign } from "../common/helper/auth.helper";
import * as bcrypt from "bcrypt";
import { uploadCloudinary } from "../common/provider/cloudinary.provider";

export class AdminService {
    private adminRepository = AppDataSource.getRepository(AdminEntity);

    async loginAdmin(data: LoginAdminDto): Promise<ApiResponse<any>> {
        const { username, password } = data;

        const admin = await this.adminRepository.findOne({
            where: { username },
        });

        if (!admin) {
            throw new ApiError(statusCode.NotFound, "Admin not found");
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            throw new ApiError(statusCode.UnAuthorized, "Invalid password");
        }

        const token = jwtSign(admin.id, admin.username, admin.username); // Assuming phone logic isn't strictly required for JWT generation if we just use username

        const { password: _, ...adminResponse } = admin;

        return new ApiResponse(statusCode.OK, { admin: adminResponse, token }, "Admin logged in successfully");
    }

    async createAdmin(data: CreateAdminDto, file?: Express.Multer.File): Promise<ApiResponse<AdminEntity>> {
        const existingAdmin = await this.adminRepository.findOne({ where: { username: data.username } });
        if (existingAdmin) {
            throw new ApiError(statusCode.Conflict, "Admin with this username already exists");
        }

        let imageUrl = "";
        if (file) {
            const uploadResult = await uploadCloudinary(file.path);
            if (uploadResult) {
                imageUrl = uploadResult.secure_url;
            }
        }

        const hashedPassword = await hashPassword(data.password, 10);

        const newAdmin = this.adminRepository.create({
            ...data,
            password: hashedPassword,
           
        });

        await this.adminRepository.save(newAdmin);

        const { password: _, ...adminResponse } = newAdmin;
        return new ApiResponse(statusCode.Created, adminResponse as AdminEntity, "Admin created successfully");
    }

    async getAllAdmins(page: number = 1, limit: number = 10): Promise<ApiResponse<AdminEntity[]>> {
        const [admins, total] = await this.adminRepository
            .findAndCount({
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: "DESC" }
            });

        const lastPage = Math.ceil(total / limit);
        const sanitizedAdmins = admins.map(({ password: _, ...admin }) => admin as AdminEntity);

        return new ApiResponse(statusCode.OK, sanitizedAdmins, "Admins retrieved successfully", page, total, lastPage);
    }

    async getAdminById(id: number): Promise<ApiResponse<AdminEntity>> {
        const admin = await this.adminRepository.findOne({ where: { id } });

        if (!admin) {
            throw new ApiError(statusCode.NotFound, "Admin not found");
        }

        const { password: _, ...adminResponse } = admin;
        return new ApiResponse(statusCode.OK, adminResponse as AdminEntity, "Admin retrieved successfully");
    }

    async updateAdmin(id: number, data: UpdateAdminDto, file?: Express.Multer.File): Promise<ApiResponse<AdminEntity>> {
        const admin = await this.adminRepository.findOne({ where: { id } });

        if (!admin) {
            throw new ApiError(statusCode.NotFound, "Admin not found");
        }

        if (data.username) {
            const existingAdmin = await this.adminRepository.findOne({ where: { username: data.username } });
            if (existingAdmin && existingAdmin.id !== id) {
                throw new ApiError(statusCode.Conflict, "Username is already taken");
            }
        }

       
        

        if (data.password) {
            data.password = await hashPassword(data.password, 10);
        }

        
        Object.assign(admin, data);
        await this.adminRepository.save(admin);

        const { password: _, ...adminResponse } = admin;
        return new ApiResponse(statusCode.OK, adminResponse as AdminEntity, "Admin updated successfully");
    }

    async deleteAdmin(id: number): Promise<ApiResponse<null>> {
        const result = await this.adminRepository.delete(id);

        if (result.affected === 0) {
            throw new ApiError(statusCode.NotFound, "Admin not found");
        }

        return new ApiResponse(statusCode.OK, null, "Admin deleted successfully");
    }
}
