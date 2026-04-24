import AppDataSource from "../config/db-config";
import { EmployeeEntity } from "../entities/employee.entity";
import { LoginUserDto, ChangePasswordDto, CreateUserDto } from "./dto/auth.dto";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { ApiResponse } from "../common/helper/api-success.helper";
import * as bcrypt from "bcrypt";
import { jwtSign, hashPassword } from "../common/helper/auth.helper";
import { GroupEntity } from "../group/entities/group.entity";
import { Hotel } from "../hotel/entities/hotel.entity";
import { Room } from "../room/entities/room.entity";
import { Airline } from "../airline/entities/airline.entity";
import { ReturnAirline } from "../airline/entities/return-airline.entity";
import * as path from "path";
import { StatusEnum } from "../types";
import { ChatService } from "../chat/chat.service";
import { Not } from "typeorm";

export class AuthService {
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);
    private groupRepository = AppDataSource.getRepository(GroupEntity);
    private hotelRepository = AppDataSource.getRepository(Hotel);
    private roomRepository = AppDataSource.getRepository(Room);
    private airlineRepository = AppDataSource.getRepository(Airline);
    private returnAirlineRepository = AppDataSource.getRepository(ReturnAirline);

    async loginUser(data: LoginUserDto): Promise<ApiResponse<any>> {
        const { email, password } = data;

        // Fetch user with all fields, explicitly including password which is select: false
        const employee = await this.employeeRepository.createQueryBuilder("employee")
            .addSelect("employee.password")
            .where("employee.email = :email", { email })
            .getOne();

        if (!employee) {
            throw new ApiError(statusCode.NotFound, "Employee not found with this email");
        }

        if (!employee.password) {
            throw new ApiError(statusCode.BadRequest, "Password not set for this account");
        }

        const isPasswordValid = await bcrypt.compare(password, employee.password);

        if (!isPasswordValid) {
            throw new ApiError(statusCode.UnAuthorized, "Invalid password");
        }

        // Update fcmToken if provided
        if (data.fcmToken) {
            employee.fcmToken = data.fcmToken;
            await this.employeeRepository.save(employee);
        }

        const token = jwtSign(employee.id, employee.employeeId, employee.fullName);

        // Sanitize response (remove password)
        const { password: _, ...employeeResponse } = employee;
        
        return new ApiResponse(statusCode.OK, { user: employeeResponse, token }, "Login successful");
    }

    async changePassword(userId: number, data: ChangePasswordDto): Promise<ApiResponse<any>> {
        const { currentPassword, newPassword } = data;

        const employee = await this.employeeRepository.findOne({
            where: { id: userId, status: Not(StatusEnum.Deactivate) },
            select: ["id", "password"]
        });

        if (!employee) {
            throw new ApiError(statusCode.NotFound, "Employee not found");
        }

        const isMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isMatch) {
            throw new ApiError(statusCode.BadRequest, "Incorrect current password");
        }

        employee.password = await hashPassword(newPassword, 10);
        await this.employeeRepository.save(employee);

        return new ApiResponse(statusCode.OK, null, "Password changed successfully");
    }

    async createUser(data: CreateUserDto, imagePath?: string, ticketImagePath?: string): Promise<ApiResponse<any>> {
        const { groupId, hotelId, roomId, airlineId, returnAirlineId, password, ...restData } = data;

        // 1. Check if employee already exists
        const existingEmployee = await this.employeeRepository.findOne({
            where: [{ employeeId: data.employeeId }, { email: data.email }]
        });
        if (existingEmployee) {
            throw new ApiError(statusCode.BadRequest, "Employee with this ID or Email already exists");
        }

        // 2. Fetch related data
        let groupData: { id: string, name: string } | null = null;
        if (groupId) {
            const group = await this.groupRepository.findOneBy({ id: groupId });
            if (group) groupData = { id: group.id.toString(), name: group.name };
        }

        let hotelName: string | null = null;
        if (hotelId) {
            const hotel = await this.hotelRepository.findOneBy({ id: hotelId });
            if (hotel) hotelName = hotel.name;
        }

        let roomData: { type: string, number: string } | null = null;
        if (roomId) {
            const room = await this.roomRepository.findOneBy({ id: roomId });
            if (room) roomData = { type: room.groupType, number: room.roomNumber.toString() };
        }

        let airlineData: any = null;
        if (airlineId) {
            const airline = await this.airlineRepository.findOneBy({ id: airlineId });
            if (airline) {
                airlineData = {
                    name: airline.name,
                    details: "", 
                    departureCity: airline.departureCity,
                    departureDate: airline.departureDate,
                    departureTime: airline.departureTime
                };
            }
        }

        let returnAirlineData: any = null;
        if (returnAirlineId) {
            const returnAirline = await this.returnAirlineRepository.findOneBy({ id: returnAirlineId });
            if (returnAirline) {
                returnAirlineData = {
                    name: returnAirline.name,
                    details: "",
                    departureCity: returnAirline.departureCity,
                    departureDate: returnAirline.departureDate,
                    departureTime: returnAirline.departureTime
                };
            }
        }

        // 3. Process images
        const baseUrl = process.env.BASE_URL;
        const imageUrl = imagePath ? `${baseUrl}/Uploads/${path.basename(imagePath)}` : "";
        const ticketImageUrl = ticketImagePath ? `${baseUrl}/Uploads/${path.basename(ticketImagePath)}` : "";

        // 4. Hash password
        const hashedPassword = await hashPassword(password, 10);

        // 5. Create Employee
        const employee = this.employeeRepository.create({
            ...restData,
            password: hashedPassword,
            group: groupData,
            hotel: hotelName,
            room: roomData,
            airline: airlineData,
            returnAirline: returnAirlineData,
            image: imageUrl,
            ticketImage: ticketImageUrl,
            status: StatusEnum.Active
        });

        await this.employeeRepository.save(employee);

        // 6. Auto-add user to global shared chat room
        try {
            const chatService = new ChatService();
            await chatService.addUserToGlobalRoom(employee.id);
        } catch (chatError) {
            console.error("Failed to add user to global chat room:", chatError);
            // Don't block user creation if chat fails
        }

        // 7. Return response (sanitized)
        const { password: _, ...employeeResponse } = employee;
        return new ApiResponse(statusCode.Created, employeeResponse, "Employee created successfully");
    }
}
