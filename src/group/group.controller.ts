import { Request, Response, NextFunction } from "express";
import { GroupService } from "./group.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class GroupController {
    private groupService: GroupService;

    constructor() {
        this.groupService = new GroupService();
    }

    create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.groupService.createGroup(req.body);
        res.status(result.statusCode).json(result);
    });

    getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.groupService.getAllGroups();
        res.status(result.statusCode).json(result);
    });

    getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.groupService.getGroupById(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });

    update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.groupService.updateGroup(Number(req.params.id), req.body);
        res.status(result.statusCode).json(result);
    });

    delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.groupService.deleteGroup(Number(req.params.id));
        res.status(result.statusCode).json(result);
    });
}
