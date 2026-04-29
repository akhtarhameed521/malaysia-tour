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

    async getAllEmployees(page?: number, limit?: number, groupId?: string): Promise<ApiResponse<EmployeeEntity[]>> {
        const whereCondition: any = {
            status: Not(StatusEnum.Deactivate)
        };

        if (groupId) {
            whereCondition.group = Raw((alias) => `${alias} ->> 'id' = :groupId`, { groupId });
        }

        const findOptions: any = {
            where: whereCondition,
            order: { id: "DESC" }
        };

        if (page !== undefined && limit !== undefined) {
            findOptions.skip = (page - 1) * limit;
            findOptions.take = limit;
        }

        const [employees, total] = await this.employeeRepository.findAndCount(findOptions);

        if (page !== undefined && limit !== undefined) {
            const lastPage = Math.ceil(total / limit);
            return new ApiResponse(statusCode.OK, employees, "Employees retrieved successfully", page, total, lastPage);
        } else {
            return new ApiResponse(statusCode.OK, employees, "Employees retrieved successfully", undefined, total);
        }
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

        const DEFAULT_PLAIN_PASSWORD = 'Welcome123';
        let createdCount = 0;
        let updatedCount = 0;

        const groups = await this.groupRepository.find();

        for (const row of data as any[]) {
            const mappedData = this.mapExcelRowToEmployee(row);

            if (!mappedData.employeeId && !mappedData.email) continue;

            // Extract plain password before saving (never store it raw)
            const { plainPassword, ...employeeData } = mappedData;

            // Auto-assign group ID if name exists or match via airline
            if (!employeeData.group || !employeeData.group.id) {
                let matchedGroup: { id: string, name: string } | null = null;
                
                // 1. Match by name if we have it in the group field
                if (employeeData.group?.name) {
                    const found = groups.find(g => g.name.toLowerCase().trim() === employeeData.group.name.toLowerCase().trim());
                    if (found) {
                        matchedGroup = { id: found.id.toString(), name: found.name };
                    }
                }
                
                // 2. Fallback to airline name
                if (!matchedGroup && employeeData.airline?.name) {
                    matchedGroup = this.findMatchingGroup(employeeData.airline.name, groups);
                }
                
                if (matchedGroup) {
                    employeeData.group = matchedGroup;
                }
            }

            const resolvedPassword = await hashPassword(
                plainPassword ?? DEFAULT_PLAIN_PASSWORD,
                10
            );

            let employee = await this.employeeRepository.createQueryBuilder("employee")
                .where("employee.employeeId = :employeeId", { employeeId: employeeData.employeeId })
                .orWhere("LOWER(employee.email) = LOWER(:email)", { email: employeeData.email })
                .getOne();

            if (employee) {
                Object.assign(employee, employeeData);
                // Only overwrite password on update if Excel explicitly provided one
                if (plainPassword) {
                    employee.password = resolvedPassword;
                }
                await this.employeeRepository.save(employee);
                updatedCount++;
            } else {
                const newEmployee = this.employeeRepository.create({
                    ...employeeData,
                    password: resolvedPassword
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

        // Normalise every key: lowercase + trim
        const normRow: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(row)) {
            normRow[key.toLowerCase().trim()] = value;
        }

        // Helper: safe string (skip undefined / null / NaN)
        const str = (v: any): string | null => {
            if (v === undefined || v === null) return null;
            const s = String(v).trim();
            return s === '' || s.toLowerCase() === 'nan' ? null : s;
        };

        // ── FLAT FIELDS ───────────────────────────────────────────────────

        // IDs
        const globalId = str(normRow['globalid']);
        mapped.globalId   = globalId;
        mapped.employeeId = str(normRow['employeeid']) ?? globalId; // fallback to globalId
        mapped.localId    = str(normRow['localid']);

        // Name / contact
        mapped.fullName = str(normRow['fullname']);
        mapped.email    = str(normRow['email'])?.toLowerCase();
        mapped.phone    = str(normRow['phone']);

        // Job / HR fields
        mapped.jobTitle         = str(normRow['jobtitle']);
        mapped.role             = str(normRow['role']);
        mapped.function         = str(normRow['function']);
        mapped.lineManager      = str(normRow['linemanager']);
        mapped.fastTrack        = str(normRow['fasttrack']);
        mapped.advancePack      = str(normRow['advancepack']);
        mapped.regionDepartment = str(normRow['regiondepartment']);
        mapped.flightStation    = str(normRow['flightstation']);
        mapped.type             = str(normRow['type']);

        // Personal
        mapped.gender             = str(normRow['gender']);
        mapped.passportNumber     = str(normRow['passportnumber']);
        mapped.passportIssDate    = str(normRow['passportissdate']);
        mapped.passportExpiryDate = str(normRow['passportexpirydate']);
        mapped.nicNumber          = str(normRow['nicnumber']);
        mapped.country            = str(normRow['country']);
        mapped.arrivalTimeKUL     = str(normRow['arrivaltimekul']);

        // Hotel
        mapped.hotel = str(normRow['hotel']);

        // Password — plain text from Excel; hashed in bulkUpload, never stored raw
        mapped.plainPassword = str(normRow['password']);

        // ── GROUP (jsonb) ─────────────────────────────────────────────────
        // Column header is: "groupId (Select from Group Tab)"
        const groupRaw = str(
            normRow['groupid (select from group tab)'] ??
            normRow['groupid'] ??
            normRow['group id']
        );
        if (groupRaw) mapped.group.name = groupRaw; // stored as name; ID resolved via findMatchingGroup

        // ── AIRLINE (jsonb) ───────────────────────────────────────────────
        const airlineName    = str(normRow['airlinename']);
        const airlineDetails = str(normRow['airlinedetails']);
        const depCity        = str(normRow['airlinedeparturecity']);
        const depDate        = str(normRow['airlinedeparturedate']);
        const depTime        = str(normRow['airlinedeparturetime']);

        if (airlineName)    mapped.airline.name          = airlineName;
        if (airlineDetails) mapped.airline.details        = airlineDetails;
        if (depCity)        mapped.airline.departureCity  = depCity;
        if (depDate)        mapped.airline.departureDate  = depDate;
        if (depTime)        mapped.airline.departureTime  = depTime;

        // ── RETURN AIRLINE (jsonb) ────────────────────────────────────────
        const retName    = str(normRow['returnairlinename']);
        const retDetails = str(normRow['returnairlinedetails']);
        const retCity    = str(normRow['returnairlinedeparturecity']);
        const retDate    = str(normRow['returnairlinedeparturedate']);
        const retTime    = str(normRow['returnairlinedeparturetime']);

        if (retName)    mapped.returnAirline.name          = retName;
        if (retDetails) mapped.returnAirline.details        = retDetails;
        if (retCity)    mapped.returnAirline.departureCity  = retCity;
        if (retDate)    mapped.returnAirline.departureDate  = retDate;
        if (retTime)    mapped.returnAirline.departureTime  = retTime;

        // ── ROOM (jsonb) ──────────────────────────────────────────────────
        const roomType   = str(normRow['roomtype']);
        const roomNumber = str(normRow['roomnumber']);
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
            let matchedGroup: { id: string, name: string } | null = null;

            // 1. Try to match by existing group name in employee record
            const currentGroupName = employee.group?.name;
            if (currentGroupName) {
                const found = groups.find(g => g.name.toLowerCase().trim() === currentGroupName.toLowerCase().trim());
                if (found) {
                    matchedGroup = { id: found.id.toString(), name: found.name };
                }
            }

            // 2. If no match by name yet, fall back to airline matching (only if ID is still missing)
            if (!matchedGroup && (!employee.group || !employee.group.id) && employee.airline?.name) {
                matchedGroup = this.findMatchingGroup(employee.airline.name, groups);
            }

            // 3. Update if we found a match and it's either a new assignment or providing a missing ID
            if (matchedGroup && (!employee.group || employee.group.id !== matchedGroup.id)) {
                employee.group = matchedGroup;
                await this.employeeRepository.save(employee);
                updatedCount++;
            }
        }

        return new ApiResponse(statusCode.OK, { updatedCount }, `${updatedCount} employees' groups auto-assigned successfully`);
    }
}
