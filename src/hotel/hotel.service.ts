import AppDataSource from "../config/db-config";
import { Hotel } from "./entities/hotel.entity";
import { CreateHotelDto, UpdateHotelDto } from "./dto/hotel.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class HotelService {
    private hotelRepository = AppDataSource.getRepository(Hotel);

    async createHotel(data: CreateHotelDto): Promise<ApiResponse<Hotel>> {
        if (data.image) {
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            data.image = `${baseUrl}/Uploads/${data.image}`;
        }

        const hotel = this.hotelRepository.create(data);
        await this.hotelRepository.save(hotel);
        return new ApiResponse(statusCode.Created, hotel, "Hotel created successfully");
    }

    async getAllHotels(): Promise<ApiResponse<Hotel[]>> {
        const hotels = await this.hotelRepository.find({
            relations: ["rooms"]
        });
        return new ApiResponse(statusCode.OK, hotels, "Hotels retrieved successfully");
    }

    async getHotelById(id: number): Promise<ApiResponse<Hotel>> {
        const hotel = await this.hotelRepository.findOne({
            where: { id },
            relations: ["rooms"]
        });
        if (!hotel) throw new ApiError(statusCode.NotFound, "Hotel not found");
        return new ApiResponse(statusCode.OK, hotel, "Hotel retrieved successfully");
    }

    async updateHotel(id: number, data: UpdateHotelDto): Promise<ApiResponse<Hotel>> {
        const hotel = await this.hotelRepository.findOneBy({ id });
        if (!hotel) throw new ApiError(statusCode.NotFound, "Hotel not found");

        if (data.image) {
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            data.image = `${baseUrl}/Uploads/${data.image}`;
        }

        Object.assign(hotel, data);
        await this.hotelRepository.save(hotel);
        return new ApiResponse(statusCode.OK, hotel, "Hotel updated successfully");
    }

    async deleteHotel(id: number): Promise<ApiResponse<null>> {
        const result = await this.hotelRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Hotel not found");
        return new ApiResponse(statusCode.OK, null, "Hotel deleted successfully");
    }
}
