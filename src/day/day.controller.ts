import { Request, Response, NextFunction } from "express";
import { DayService } from "./day.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class DayController {
    private dayService: DayService;

    constructor() {
        this.dayService = new DayService();
    }

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.dayService.createDay(req.body);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.dayService.getAllDays();
        res.status(result.statusCode).json(result);
    });

    getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.dayService.getDayById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.dayService.updateDay(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.dayService.deleteDay(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });
}
