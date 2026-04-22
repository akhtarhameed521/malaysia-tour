import { Request, Response, NextFunction } from "express";
import { ExploreService } from "./explore.service";
import { asyncHandler } from "../common/helper/async-handler.helper";
import { ExploreType } from "../types";

export class ExploreController {
    private exploreService: ExploreService;

    constructor() {
        this.exploreService = new ExploreService();
    }

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const imagePath = req.file?.path;
        const result = await this.exploreService.createExplore(req.body, imagePath);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const type = req.query.type as ExploreType;
        const result = await this.exploreService.getAllExplore(type);
        res.status(result.statusCode).json(result);
    });

    getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.exploreService.getExploreById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const imagePath = req.file?.path;
        const result = await this.exploreService.updateExplore(Number(req.params.id), req.body, imagePath);
        res.status(result.statusCode).json(result);
    });

    delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.exploreService.deleteExplore(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });
}
