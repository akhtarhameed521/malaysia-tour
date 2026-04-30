import { Request, Response, NextFunction } from "express";
import { RoomService } from "./room.service";
import { asyncHandler } from "../common/helper/async-handler.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class RoomController {
    private roomService: RoomService;

    constructor() {
        this.roomService = new RoomService();
    }

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.roomService.createRoom(req.body);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.roomService.getAllRooms();
        res.status(result.statusCode).json(result);
    });

    getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.roomService.getRoomById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.roomService.updateRoom(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.roomService.deleteRoom(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    bulkUpload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;
        if (!file) {
            throw new ApiError(statusCode.BadRequest, "No file uploaded");
        }
        const result = await this.roomService.bulkUploadRooms(file.buffer);
        res.status(result.statusCode).json(result);
    });
}
