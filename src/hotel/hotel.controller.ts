import { Request, Response, NextFunction } from "express";
import { HotelService } from "./hotel.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class HotelController {
    private hotelService: HotelService;

    constructor() {
        this.hotelService = new HotelService();
    }

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
            req.body.image = req.file.filename;
        }
        const result = await this.hotelService.createHotel(req.body);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.hotelService.getAllHotels();
        res.status(result.statusCode).json(result);
    });

    getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.hotelService.getHotelById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
            req.body.image = req.file.filename;
        }
        const result = await this.hotelService.updateHotel(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.hotelService.deleteHotel(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });
}
