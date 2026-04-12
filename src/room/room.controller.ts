import { Request, Response, NextFunction } from "express";
import { RoomService } from "./room.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

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
}
