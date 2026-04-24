import { Request, Response, NextFunction } from "express";
import { SessionService } from "./session.service";
import { asyncHandler } from "../common/helper/async-handler.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class SessionController {
    private sessionService: SessionService;

    constructor() {
        this.sessionService = new SessionService();
    }

    getSessionsByMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const employeeId = req.user?.employeeId as string;
        const result = await this.sessionService.getSessionsByEmployee(employeeId);
        res.status(result.statusCode).json(result);
    });

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.sessionService.createSession(req.body);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
        const result = await this.sessionService.getAllSessions(groupId);
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

    bulkUpload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) {
            throw new ApiError(statusCode.BadRequest, "Please upload an Excel or CSV file");
        }
        const result = await this.sessionService.bulkUploadSessions(req.file.path);
        res.status(result.statusCode).json(result);
    });
}
