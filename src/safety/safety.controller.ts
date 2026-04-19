import { Request, Response, NextFunction } from "express";
import { SafetyService } from "./safety.service";
import { asyncHandler } from "../common/helper/async-handler.helper";
import { SafetyType } from "../types";

export class SafetyController {
    private safetyService: SafetyService;

    constructor() {
        this.safetyService = new SafetyService();
    }

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.safetyService.createSafety(req.body);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const type = req.query.type as SafetyType;
        const result = await this.safetyService.getAllSafety(type);
        res.status(result.statusCode).json(result);
    });

    getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.safetyService.getSafetyById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.safetyService.updateSafety(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.safetyService.deleteSafety(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });
}
