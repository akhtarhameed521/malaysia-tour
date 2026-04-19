import AppDataSource from "../config/db-config";
import { EmployeeEntity } from "../entities/employee.entity";
import { ApiResponse } from "../common/helper/api-success.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { Not, Raw } from "typeorm";
import { StatusEnum } from "../types";
import { ApiError } from "@helper/api-error.helper";
import { GroupEntity } from "../group/entities/group.entity";
import { Hotel } from "../hotel/entities/hotel.entity";
import { Room } from "../room/entities/room.entity";
import { Airline } from "../airline/entities/airline.entity";
import { ReturnAirline } from "../airline/entities/return-airline.entity";
import * as path from "path";

export class EmployeeService {
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);
    private groupRepository = AppDataSource.getRepository(GroupEntity);
    private hotelRepository = AppDataSource.getRepository(Hotel);
    private roomRepository = AppDataSource.getRepository(Room);
    private airlineRepository = AppDataSource.getRepository(Airline);
    private returnAirlineRepository = AppDataSource.getRepository(ReturnAirline);

    async getAllEmployees(page: number = 1, limit: number = 10, groupId?: string): Promise<ApiResponse<EmployeeEntity[]>> {
        const whereCondition: any = {
            status: Not(StatusEnum.Deactivate)
        };

        if (groupId) {
            whereCondition.group = Raw((alias) => `${alias} ->> 'id' = :groupId`, { groupId });
        }

        const [employees, total] = await this.employeeRepository.findAndCount({
            where: whereCondition,
            skip: (page - 1) * limit,
            take: limit
        });

        const lastPage = Math.ceil(total / limit);
        return new ApiResponse(statusCode.OK, employees, "Employees retrieved successfully", page, total, lastPage);
    }

    async getEmployeeByEmployeeId(employeeId: string): Promise<ApiResponse<EmployeeEntity>> {
        const employee = await this.employeeRepository.findOne({
            where: {
                employeeId,
                status: Not(StatusEnum.Deactivate)
            }
        });
        if (!employee) {
            throw new ApiError(statusCode.NotFound, "Employee not found");
        }
        return new ApiResponse(statusCode.OK, employee, "Employee retrieved successfully");
    }

    async getEmployeeById(id: number): Promise<ApiResponse<EmployeeEntity>> {
        const employee = await this.employeeRepository.findOneBy({ 
            id, 
            status: Not(StatusEnum.Deactivate) 
        });
        if (!employee) {
            throw new ApiError(statusCode.NotFound, "Employee not found");
        }
        return new ApiResponse(statusCode.OK, employee, "Employee retrieved successfully");
    }

    async updateEmployee(id: number, data: any, imagePath?: string, ticketImagePath?: string): Promise<ApiResponse<EmployeeEntity>> {
        const employee = await this.employeeRepository.findOneBy({ id });
        if (!employee || employee.status === StatusEnum.Deactivate) {
            throw new ApiError(statusCode.NotFound, "Employee not found");
        }
        
        const { groupId, hotelId, roomId, airlineId, returnAirlineId, ...restData } = data;

        // 0. Check for duplicate employeeId or email only if they are changing
        const duplicateConditions: any[] = [];
        if (restData.employeeId && restData.employeeId !== employee.employeeId) {
            duplicateConditions.push({ employeeId: restData.employeeId, id: Not(id) });
        }
        if (restData.email && restData.email !== employee.email) {
            duplicateConditions.push({ email: restData.email, id: Not(id) });
        }

        if (duplicateConditions.length > 0) {
            const duplicate = await this.employeeRepository.findOne({
                where: duplicateConditions
            });
            if (duplicate) {
                throw new ApiError(statusCode.BadRequest, "Employee ID or Email already taken by another account");
            }
        }

        // 1. Resolve Relationships/IDs to JSON format
        if (groupId) {
            const group = await this.groupRepository.findOneBy({ id: groupId });
            if (group) employee.group = { id: group.id.toString(), name: group.name };
        }

        if (hotelId) {
            const hotel = await this.hotelRepository.findOneBy({ id: hotelId });
            if (hotel) employee.hotel = hotel.name;
        }

        if (roomId) {
            const room = await this.roomRepository.findOneBy({ id: roomId });
            if (room) employee.room = { type: room.groupType, number: room.roomNumber.toString() };
        }

        if (airlineId) {
            const airline = await this.airlineRepository.findOneBy({ id: airlineId });
            if (airline) {
                employee.airline = {
                    name: airline.name,
                    details: "", 
                    departureCity: airline.departureCity,
                    departureDate: airline.departureDate,
                    departureTime: airline.departureTime
                };
            }
        }

        if (returnAirlineId) {
            const returnAirline = await this.returnAirlineRepository.findOneBy({ id: returnAirlineId });
            if (returnAirline) {
                employee.returnAirline = {
                    name: returnAirline.name,
                    details: "",
                    departureCity: returnAirline.departureCity,
                    departureDate: returnAirline.departureDate,
                    departureTime: returnAirline.departureTime
                };
            }
        }

        // 2. Handle images
        const baseUrl = process.env.BASE_URL;
        if (imagePath) {
            employee.image = `${baseUrl}/Uploads/${path.basename(imagePath)}`;
        }
        if (ticketImagePath) {
            employee.ticketImage = `${baseUrl}/Uploads/${path.basename(ticketImagePath)}`;
        }

        // 3. Assign rest data (excluding password which should be handled by changePassword)
        if (restData.password) delete restData.password;
        Object.assign(employee, restData);

        await this.employeeRepository.save(employee);
        return new ApiResponse(statusCode.OK, employee, "Employee updated successfully");
    }

    async deleteEmployee(id: number): Promise<ApiResponse<null>> {
        const employee = await this.employeeRepository.findOneBy({ id });
        if (!employee || employee.status === StatusEnum.Deactivate) {
            throw new ApiError(statusCode.NotFound, "Employee not found or already deactivated");
        }
        
        employee.status = StatusEnum.Deactivate;
        await this.employeeRepository.save(employee);
        return new ApiResponse(statusCode.OK, null, "Employee deleted successfully");
    }
}
