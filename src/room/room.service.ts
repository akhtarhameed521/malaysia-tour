import AppDataSource from "../config/db-config";
import { Room } from "./entities/room.entity";
import { Hotel } from "../hotel/entities/hotel.entity";
import { CreateRoomDto, UpdateRoomDto } from "./dto/room.dto";
import { ApiResponse } from "../common/helper/api-success.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";
import * as xlsx from "xlsx";

export class RoomService {
    private roomRepository = AppDataSource.getRepository(Room);
    private hotelRepository = AppDataSource.getRepository(Hotel);

    async createRoom(data: CreateRoomDto): Promise<ApiResponse<Room>> {
        const hotel = await this.hotelRepository.findOneBy({ id: data.hotelId });
        if (!hotel) {
            throw new ApiError(statusCode.NotFound, "Hotel not found");
        }

        const room = this.roomRepository.create({
            roomNumber: data.roomNumber,
            floor: data.floor,
            groupType: data.groupType,
            hotel: hotel
        });
        await this.roomRepository.save(room);
        return new ApiResponse(statusCode.Created, room, "Room created successfully");
    }

    async getAllRooms(): Promise<ApiResponse<Room[]>> {
        const rooms = await this.roomRepository.find({
            relations: ["hotel"]
        });
        return new ApiResponse(statusCode.OK, rooms, "Rooms retrieved successfully");
    }

    async getRoomById(id: number): Promise<ApiResponse<Room>> {
        const room = await this.roomRepository.findOne({
            where: { id },
            relations: ["hotel"]
        });
        if (!room) throw new ApiError(statusCode.NotFound, "Room not found");
        return new ApiResponse(statusCode.OK, room, "Room retrieved successfully");
    }

    async updateRoom(id: number, data: UpdateRoomDto): Promise<ApiResponse<Room>> {
        const room = await this.roomRepository.findOneBy({ id });
        if (!room) throw new ApiError(statusCode.NotFound, "Room not found");

        if (data.hotelId) {
            const hotel = await this.hotelRepository.findOneBy({ id: data.hotelId });
            if (!hotel) throw new ApiError(statusCode.NotFound, "Hotel not found");
            room.hotel = hotel;
        }

        Object.assign(room, data);
        await this.roomRepository.save(room);
        return new ApiResponse(statusCode.OK, room, "Room updated successfully");
    }

    async deleteRoom(id: number): Promise<ApiResponse<null>> {
        const result = await this.roomRepository.delete({ id });
        if (result.affected === 0) throw new ApiError(statusCode.NotFound, "Room not found");
        return new ApiResponse(statusCode.OK, null, "Room deleted successfully");
    }

    async bulkUploadRooms(fileBuffer: Buffer): Promise<ApiResponse<any>> {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const hotels = await this.hotelRepository.find();
        let createdCount = 0;
        let skippedCount = 0;
        const totalInExcel = data.length;

        for (const row of data as any[]) {
            const hotelName = row.hotelId || row.HotelId || row['Hotel Name'] || row['hotelName'];
            const roomNumber = row.roomNumber || row['Room Number'];
            const groupType = row.groupType || row['Group Type'];
            const floor = row.floor || row['Floor'];

            if (!hotelName || !roomNumber) {
                skippedCount++;
                continue;
            }

            const matchedHotel = hotels.find(h => h.name.toLowerCase().trim() === hotelName.toString().toLowerCase().trim());

            if (!matchedHotel) {
                skippedCount++;
                continue;
            }

            const room = this.roomRepository.create({
                roomNumber: Number(roomNumber),
                floor: floor ? Number(floor) : null,
                groupType: groupType ? groupType.toString() : null,
                hotel: matchedHotel
            });

            await this.roomRepository.save(room);
            createdCount++;
        }

        return new ApiResponse(statusCode.OK, { createdCount, skippedCount, totalInExcel }, `${createdCount} rooms uploaded successfully, ${skippedCount} skipped`);
    }
}
