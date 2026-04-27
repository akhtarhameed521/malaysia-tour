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
import * as xlsx from "xlsx";
import { hashPassword, comparePassword } from "../common/helper/auth.helper";
import { AdminChangePasswordDto } from "../auth/dto/auth.dto";

export class EmployeeService {
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);
    private groupRepository = AppDataSource.getRepository(GroupEntity);
    private hotelRepository = AppDataSource.getRepository(Hotel);
    private roomRepository = AppDataSource.getRepository(Room);
    private airlineRepository = AppDataSource.getRepository(Airline);
    private returnAirlineRepository = AppDataSource.getRepository(ReturnAirline);

    private findMatchingGroup(airlineName: string | null, groups: GroupEntity[]): { id: string, name: string } | null {
        if (!airlineName) return null;

        const normAirline = airlineName.toLowerCase().trim();
        const airlineFirstWord = normAirline.split(/\s+/)[0];

        for (const group of groups) {
            const normGroup = group.name.toLowerCase().trim();
            const groupFirstWord = normGroup.split(/\s+/)[0];

            // Match if:
            // 1. First words are identical (e.g. "Thai" matches "THAI AIRWAYS")
            // 2. One starts with the other
            // 3. One contains the other
            if (
                (groupFirstWord && airlineFirstWord && groupFirstWord === airlineFirstWord) ||
                normGroup.startsWith(normAirline) ||
                normAirline.startsWith(normGroup) ||
                normGroup.includes(normAirline) ||
                normAirline.includes(normGroup)
            ) {
                return { id: group.id.toString(), name: group.name };
            }
        }
        return null;
    }

    async getAllEmployees(page: number = 1, limit: number = 10, groupId?: string): Promise<ApiResponse<EmployeeEntity[]>> {
        const whereCondition: any = {
            status: Not(StatusEnum.Deactivate)
        };

        if (groupId) {
            whereCondition.group = Raw((alias) => `${alias} ->> 'id' = :groupId`, { groupId });
        }

        const [employees, total] = await this.employeeRepository.findAndCount({
            where: whereCondition,
            order: { id: "DESC" },
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
        if (restData.employeeId && restData.employeeId !== employee.employeeId) {
            const duplicate = await this.employeeRepository.findOne({
                where: { employeeId: restData.employeeId, id: Not(id) }
            });
            if (duplicate) {
                throw new ApiError(statusCode.BadRequest, "Employee ID already taken by another account");
            }
        }
        if (restData.email && restData.email.toLowerCase() !== employee.email?.toLowerCase()) {
            const duplicate = await this.employeeRepository.createQueryBuilder("employee")
                .where("LOWER(employee.email) = LOWER(:email)", { email: restData.email })
                .andWhere("employee.id != :id", { id })
                .getOne();
            if (duplicate) {
                throw new ApiError(statusCode.BadRequest, "Email already taken by another account");
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
        if (restData.email) restData.email = restData.email.toLowerCase();
        Object.assign(employee, restData);

        await this.employeeRepository.save(employee);
        return new ApiResponse(statusCode.OK, employee, "Employee updated successfully");
    }

    async adminChangePassword(data: AdminChangePasswordDto): Promise<ApiResponse<null>> {
        const employee = await this.employeeRepository.findOne({
            where: { id: Number(data.employeeId), status: Not(StatusEnum.Deactivate) },
            select: ["id", "password"]
        });

        if (!employee) {
            throw new ApiError(statusCode.NotFound, "Employee not found");
        }

        employee.password = await hashPassword(data.newPassword, 10);
        await this.employeeRepository.save(employee);

        return new ApiResponse(statusCode.OK, null, "Password changed successfully");
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

    async bulkUpload(fileBuffer: Buffer): Promise<ApiResponse<any>> {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const defaultPassword = await hashPassword('Welcome123', 10);
        let createdCount = 0;
        let updatedCount = 0;

        const groups = await this.groupRepository.find();

        for (const row of data as any[]) {
            const mappedData = this.mapExcelRowToEmployee(row);
            
            if (!mappedData.employeeId && !mappedData.email) continue;

            // Auto-assign group if not present but airline exists
            if ((!mappedData.group || !mappedData.group.id) && mappedData.airline?.name) {
                const matchedGroup = this.findMatchingGroup(mappedData.airline.name, groups);
                if (matchedGroup) {
                    mappedData.group = matchedGroup;
                }
            }

            let employee = await this.employeeRepository.createQueryBuilder("employee")
                .where("employee.employeeId = :employeeId", { employeeId: mappedData.employeeId })
                .orWhere("LOWER(employee.email) = LOWER(:email)", { email: mappedData.email })
                .getOne();

            if (employee) {
                Object.assign(employee, mappedData);
                await this.employeeRepository.save(employee);
                updatedCount++;
            } else {
                const newEmployee = this.employeeRepository.create({
                    ...mappedData,
                    password: defaultPassword
                } as any);
                await this.employeeRepository.save(newEmployee);
                createdCount++;
            }
        }

        return new ApiResponse(statusCode.OK, { createdCount, updatedCount }, "Bulk upload completed successfully");
    }

   private mapExcelRowToEmployee(row: any): any {
    const mapped: any = {
        group: {},
        airline: {},
        returnAirline: {},
        room: {}
    };
 
    // ── Normalise every key: lowercase + trim ──────────────────────────
    const normRow: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(row)) {
        normRow[key.toLowerCase().trim()] = value;
    }
 
    // ── Helper: safe string (skip undefined / null / NaN) ─────────────
    const str = (v: any): string | null => {
        if (v === undefined || v === null) return null;
        const s = String(v).trim();
        return s === '' || s.toLowerCase() === 'nan' ? null : s;
    };
 
    // ── FLAT FIELDS ───────────────────────────────────────────────────
    // Type  (4th-7th, Advance 1, Advance 2, Others …)
    mapped.type = str(normRow['type']);
 
    // IDs
    const globalId = str(normRow['global id']);
    mapped.globalId   = globalId;
    mapped.employeeId = globalId;                       // sync
    mapped.localId    = str(normRow['local id']);
 
    // Name
    const fullName  = str(normRow['name']);
    const firstName = str(normRow['first name'] ?? normRow['given name']);
    const lastName  = str(normRow['last name']  ?? normRow['surname']);
    mapped.fullName = fullName ?? (firstName || lastName
        ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
        : null);
 
    // Contact
    mapped.email  = str(normRow['email'])?.toLowerCase();
    mapped.phone  = str(normRow['cell #'] ?? normRow['phone no'] ?? normRow['phone'] ?? normRow['mobile'] ?? normRow['contact']);
 
    // Job / HR fields
    mapped.jobTitle          = str(normRow['job title']);
    mapped.role              = str(normRow['role']);
    mapped.function          = str(normRow['function']);
    mapped.lineManager       = str(normRow['line manager']);
    mapped.fastTrack         = str(normRow['fast track'] ?? normRow['fast_track']);
    mapped.advancePack       = str(normRow['advance pack']);
    mapped.regionDepartment  = str(normRow['region / department'] ?? normRow['region/department'] ?? normRow['region department']);
    mapped.flightStation     = str(normRow['flight station']);
 
    // Personal
    mapped.gender              = str(normRow['gender']);
    mapped.passportNumber      = str(normRow['passport #'] ?? normRow['passport no']);
    mapped.passportIssDate     = str(normRow['passport date issue'] ?? normRow['passport date iss'] ?? normRow['passport iss date']);
    mapped.passportExpiryDate  = str(normRow['passport expiry date']);
    mapped.nicNumber           = str(normRow['nic #'] ?? normRow['nic no']);
    mapped.country             = str(normRow['country']);
 
    // Return-flight date flags
    mapped.returnFlight7thMay  = str(normRow['return flight 7th may']);
    mapped.returnFlight8thMay  = str(normRow['return flight 8th may']);
    mapped.returnFlight9thMay  = str(normRow['return flight 9th may']);
    mapped.returnFlight10thMay = str(normRow['return flight 10th may']);
 
    // Hotel
    mapped.hotel = str(normRow['hotel']);
 
    // Arrival time
    mapped.arrivalTimeKUL = str(normRow['arrival time at kul']);
 
    // ── GROUP (jsonb) ─────────────────────────────────────────────────
    const groupId   = str(normRow['groupid'] ?? normRow['group id'] ?? normRow['group_id']);
    const groupName = str(normRow['group'] ?? normRow['group name']);
    if (groupId)   mapped.group.id   = groupId;
    if (groupName) mapped.group.name = groupName;
 
    // ── AIRLINE (jsonb) ── departure / outbound ────────────────────────
    // Excel columns: Airline | Air Line Detail | Departure Date | Departure City | Departure Time
    const airlineName    = str(normRow['airline']);
    const airlineDetails = str(normRow['air line detail'] ?? normRow['air line details'] ?? normRow['airline detail']);
    const depDate        = str(normRow['departure date']);
    const depCity        = str(normRow['departure city']);
    const depTime        = str(normRow['departure time']);
 
    if (airlineName)    mapped.airline.name          = airlineName;
    if (airlineDetails) mapped.airline.details        = airlineDetails;
    if (depDate)        mapped.airline.departureDate  = depDate;
    if (depCity)        mapped.airline.departureCity  = depCity;
    if (depTime)        mapped.airline.departureTime  = depTime;
 
    // ── RETURN AIRLINE (jsonb) ── xlsx renames duplicate cols with .1 ──
    // Excel columns: Airline.1 | Return flight- Air line | Departure date | Derparture time | Departure City.1
    const retAirlineName    = str(normRow['airline.1'] ?? normRow['return airline'] ?? normRow['return air line']);
    const retAirlineDetails = str(normRow['return flight- air line'] ?? normRow['return flight- airline'] ?? normRow['return flight-air line'] ?? normRow['return airline details']);
    const retDepDate        = str(normRow['departure date.1'] ?? normRow['return departure date']);  // sometimes pandas suffixes with .1
    // NOTE: xlsx lib (js) keeps original name; pandas renames. Both covered:
    const retDepDateAlt     = str(normRow['departure date'] !== depDate ? normRow['departure date'] : null);
    const retDepTime        = str(normRow['derparture time'] ?? normRow['departure time.1'] ?? normRow['return departure time']);
    const retDepCity        = str(normRow['departure city.1'] ?? normRow['return departure city']);
 
    if (retAirlineName)    mapped.returnAirline.name          = retAirlineName;
    if (retAirlineDetails) mapped.returnAirline.details        = retAirlineDetails;
    if (retDepDate || retDepDateAlt) mapped.returnAirline.departureDate = retDepDate ?? retDepDateAlt;
    if (retDepTime)        mapped.returnAirline.departureTime  = retDepTime;
    if (retDepCity)        mapped.returnAirline.departureCity  = retDepCity;
 
    // ── ROOM (jsonb) ──────────────────────────────────────────────────
    const roomType   = str(normRow['room type']);
    const roomNumber = str(normRow['room number'] ?? normRow['room']);
    if (roomType)   mapped.room.type   = roomType;
    if (roomNumber) mapped.room.number = roomNumber;
 
    // ── CLEAN UP empty nested objects → null ──────────────────────────
    if (Object.keys(mapped.group).length === 0)         mapped.group         = null;
    if (Object.keys(mapped.airline).length === 0)       mapped.airline       = null;
    if (Object.keys(mapped.returnAirline).length === 0) mapped.returnAirline = null;
    if (Object.keys(mapped.room).length === 0)          mapped.room          = null;
 
    return mapped;
}

    async syncGroups(): Promise<ApiResponse<any>> {
        const employees = await this.employeeRepository.find({
            where: { status: Not(StatusEnum.Deactivate) }
        });
        const groups = await this.groupRepository.find();
        
        let updatedCount = 0;

        for (const employee of employees) {
            if ((!employee.group || !employee.group.id) && employee.airline?.name) {
                const matchedGroup = this.findMatchingGroup(employee.airline.name, groups);
                if (matchedGroup) {
                    employee.group = matchedGroup;
                    await this.employeeRepository.save(employee);
                    updatedCount++;
                }
            }
        }

        return new ApiResponse(statusCode.OK, { updatedCount }, `${updatedCount} employees' groups auto-assigned successfully`);
    }
}
