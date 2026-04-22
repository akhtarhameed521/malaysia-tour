import { Request, Response, NextFunction } from "express";
import { DiscoverService } from "./discover.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class DiscoverController {
    private discoverService: DiscoverService;

    constructor() {
        this.discoverService = new DiscoverService();
    }

    getDiscover = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.discoverService.getDiscoverData();
        res.status(result.statusCode).json(result);
    });
}
