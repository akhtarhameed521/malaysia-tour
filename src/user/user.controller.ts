import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await this.userService.getAllUsers(page, limit);
        res.status(result.statusCode).send(result);
    });

    getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const result = await this.userService.getUserById(id);
        res.status(result.statusCode).send(result);
    });

    updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const result = await this.userService.updateUser(id, req.body);
        res.status(result.statusCode).send(result);
    });

    deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const result = await this.userService.deleteUser(id);
        res.status(result.statusCode).send(result);
    });

   

  
}
