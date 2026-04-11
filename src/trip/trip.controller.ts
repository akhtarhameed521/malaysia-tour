import { Request, Response, NextFunction } from "express";
import { TripService } from "./trip.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class TripController {
    private tripService: TripService;

    constructor() {
        this.tripService = new TripService();
    }

    createHotel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.createHotel(req.body);
        res.status(result.statusCode).json(result);
    });

    createRoom = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.createRoom(req.body);
        res.status(result.statusCode).json(result);
    });

    createMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
            req.body.image = req.file.filename;
        }
        const result = await this.tripService.createMember(req.body);
        res.status(result.statusCode).json(result);
    });

    getTrips = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.getTrips();
        res.status(result.statusCode).json(result);
    });

    updateHotel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.updateHotel(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    deleteHotel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.deleteHotel(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    updateRoom = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.updateRoom(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    deleteRoom = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.deleteRoom(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    updateMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
            req.body.image = req.file.filename;
        }
        const result = await this.tripService.updateMember(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    deleteMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.deleteMember(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    deleteAllTrips = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.tripService.deleteAllTrips();
        res.status(result.statusCode).json(result);
    });
}
