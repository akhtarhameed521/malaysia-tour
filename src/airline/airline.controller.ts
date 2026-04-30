import { Request, Response, NextFunction } from "express";
import { AirlineService } from "./airline.service";
import { asyncHandler } from "../common/helper/async-handler.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class AirlineController {
    private airlineService: AirlineService;

    constructor() {
        this.airlineService = new AirlineService();
    }

    // Airline Controllers
    createAirline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.createAirline(req.body);
        res.status(result.statusCode).json(result);
    });

    getAllAirlines = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const result = await this.airlineService.getAllAirlines(page, limit);
        res.status(result.statusCode).json(result);
    });

    getAirlineOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.getAirlineById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    updateAirline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.updateAirline(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    deleteAirline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.deleteAirline(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    bulkUploadAirlines = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;
        if (!file) {
            throw new ApiError(statusCode.BadRequest, "No file uploaded");
        }
        const result = await this.airlineService.bulkUploadAirlines(file.buffer);
        res.status(result.statusCode).json(result);
    });

    // ReturnAirline Controllers
    createReturnAirline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.createReturnAirline(req.body);
        res.status(result.statusCode).json(result);
    });

    getAllReturnAirlines = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const result = await this.airlineService.getAllReturnAirlines(page, limit);
        res.status(result.statusCode).json(result);
    });

    getReturnAirlineOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.getReturnAirlineById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    updateReturnAirline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.updateReturnAirline(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    deleteReturnAirline = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.airlineService.deleteReturnAirline(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    bulkUploadReturnAirlines = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;
        if (!file) {
            throw new ApiError(statusCode.BadRequest, "No file uploaded");
        }
        const result = await this.airlineService.bulkUploadReturnAirlines(file.buffer);
        res.status(result.statusCode).json(result);
    });
}
