import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }
    createEmployee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.authService.createEmployee(req.body);
        res.status(result.statusCode).send(result);
    });

    registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const imagePath = req.file?.path;
        const result = await this.authService.registerUser(req.body, imagePath);
        res.status(result.statusCode).send(result);
    });

    public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.authService.loginUser(req.body);
        res.status(result.statusCode).json(result);
    });

    public changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.authService.changePassword(req.body);
        res.status(result.statusCode).json(result);
    });
}
