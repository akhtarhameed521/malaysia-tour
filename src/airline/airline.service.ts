import AppDataSource from "../config/db-config";
import { Airline } from "./entities/airline.entity";
import { ReturnAirline } from "./entities/return-airline.entity";
import { CreateAirlineDto, UpdateAirlineDto, CreateReturnAirlineDto, UpdateReturnAirlineDto } from "./dto/airline.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import * as xlsx from "xlsx";

export class AirlineService {
    private airlineRepository = AppDataSource.getRepository(Airline);
    private returnAirlineRepository = AppDataSource.getRepository(ReturnAirline);

    // Airline CRUD
    async createAirline(data: CreateAirlineDto): Promise<ApiResponse<Airline>> {
        const airline = this.airlineRepository.create(data);
        await this.airlineRepository.save(airline);
        return new ApiResponse(statusCode.Created, airline, "Airline created successfully");
    }

    async getAllAirlines(page?: number, limit?: number): Promise<ApiResponse<Airline[]>> {
        const findOptions: any = {
            order: { id: "ASC" }
        };

        if (page !== undefined && limit !== undefined) {
            findOptions.skip = (page - 1) * limit;
            findOptions.take = limit;
        }

        const [airlines, total] = await this.airlineRepository.findAndCount(findOptions);

        if (page !== undefined && limit !== undefined) {
            const lastPage = Math.ceil(total / limit);
            return new ApiResponse(statusCode.OK, airlines, "Airlines retrieved successfully", page, total, lastPage);
        } else {
            return new ApiResponse(statusCode.OK, airlines, "Airlines retrieved successfully", undefined, total);
        }
    }

    async getAirlineById(id: number): Promise<ApiResponse<Airline>> {
        const airline = await this.airlineRepository.findOneBy({ id });
        if (!airline) throw new ApiError(statusCode.NotFound, "Airline not found");
        return new ApiResponse(statusCode.OK, airline, "Airline retrieved successfully");
    }

    async updateAirline(id: number, data: UpdateAirlineDto): Promise<ApiResponse<Airline>> {
        const airline = await this.airlineRepository.findOneBy({ id });
        if (!airline) throw new ApiError(statusCode.NotFound, "Airline not found");

        Object.assign(airline, data);
        await this.airlineRepository.save(airline);
        return new ApiResponse(statusCode.OK, airline, "Airline updated successfully");
    }

    async deleteAirline(id: number): Promise<ApiResponse<null>> {
        const result = await this.airlineRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Airline not found");
        return new ApiResponse(statusCode.OK, null, "Airline deleted successfully");
    }

    // ReturnAirline CRUD
    async createReturnAirline(data: CreateReturnAirlineDto): Promise<ApiResponse<ReturnAirline>> {
        const returnAirline = this.returnAirlineRepository.create(data);
        await this.returnAirlineRepository.save(returnAirline);
        return new ApiResponse(statusCode.Created, returnAirline, "Return Airline created successfully");
    }

    async getAllReturnAirlines(page?: number, limit?: number): Promise<ApiResponse<ReturnAirline[]>> {
        const findOptions: any = {
            order: { id: "ASC" }
        };

        if (page !== undefined && limit !== undefined) {
            findOptions.skip = (page - 1) * limit;
            findOptions.take = limit;
        }

        const [returnAirlines, total] = await this.returnAirlineRepository.findAndCount(findOptions);

        if (page !== undefined && limit !== undefined) {
            const lastPage = Math.ceil(total / limit);
            return new ApiResponse(statusCode.OK, returnAirlines, "Return Airlines retrieved successfully", page, total, lastPage);
        } else {
            return new ApiResponse(statusCode.OK, returnAirlines, "Return Airlines retrieved successfully", undefined, total);
        }
    }

    async getReturnAirlineById(id: number): Promise<ApiResponse<ReturnAirline>> {
        const returnAirline = await this.returnAirlineRepository.findOneBy({ id });
        if (!returnAirline) throw new ApiError(statusCode.NotFound, "Return Airline not found");
        return new ApiResponse(statusCode.OK, returnAirline, "Return Airline retrieved successfully");
    }

    async updateReturnAirline(id: number, data: UpdateReturnAirlineDto): Promise<ApiResponse<ReturnAirline>> {
        const returnAirline = await this.returnAirlineRepository.findOneBy({ id });
        if (!returnAirline) throw new ApiError(statusCode.NotFound, "Return Airline not found");

        Object.assign(returnAirline, data);
        await this.returnAirlineRepository.save(returnAirline);
        return new ApiResponse(statusCode.OK, returnAirline, "Return Airline updated successfully");
    }

    async deleteReturnAirline(id: number): Promise<ApiResponse<null>> {
        const result = await this.returnAirlineRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Return Airline not found");
        return new ApiResponse(statusCode.OK, null, "Return Airline deleted successfully");
    }

    async bulkUploadAirlines(fileBuffer: Buffer): Promise<ApiResponse<any>> {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

        let createdCount = 0;
        const totalInExcel = data.length;

        for (const row of data as any[]) {
            const mappedData = {
                name: row.name || row.Name || row['Airline Name'],
                departureCity: row.departureCity || row.DepartureCity || row['Departure City'],
                departureDate: row.departureDate || row.DepartureDate || row['Departure Date'],
                departureTime: row.departureTime || row.DepartureTime || row['Departure Time'],
                isReturn: false
            };

            if (!mappedData.name) continue;

            const airline = this.airlineRepository.create(mappedData);
            await this.airlineRepository.save(airline);
            createdCount++;
        }

        return new ApiResponse(statusCode.OK, { createdCount, totalInExcel }, `${createdCount} airlines uploaded successfully`);
    }

    async bulkUploadReturnAirlines(fileBuffer: Buffer): Promise<ApiResponse<any>> {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

        let createdCount = 0;
        const totalInExcel = data.length;

        for (const row of data as any[]) {
            const mappedData = {
                name: row.name || row.Name || row['Airline Name'],
                departureCity: row.departureCity || row.DepartureCity || row['Departure City'],
                departureDate: row.departureDate || row.DepartureDate || row['Departure Date'],
                departureTime: row.departureTime || row.DepartureTime || row['Departure Time'],
                isReturn: true
            };

            if (!mappedData.name) continue;

            const returnAirline = this.returnAirlineRepository.create(mappedData);
            await this.returnAirlineRepository.save(returnAirline);
            createdCount++;
        }

        return new ApiResponse(statusCode.OK, { createdCount, totalInExcel }, `${createdCount} return airlines uploaded successfully`);
    }
}
