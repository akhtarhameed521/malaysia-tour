import { Request, Response, NextFunction } from "express";
import { SessionService } from "./session.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class SessionController {
    private sessionService: SessionService;

    constructor() {
        this.sessionService = new SessionService();
    }

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.sessionService.createSession(req.body);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.sessionService.getAllSessions();
        res.status(result.statusCode).json(result);
    });

    getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.sessionService.getSessionById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.sessionService.updateSession(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.sessionService.deleteSession(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });
}
