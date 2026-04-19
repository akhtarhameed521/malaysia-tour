import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }
  

    public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.authService.loginUser(req.body);
        res.status(result.statusCode).json(result);
    });

    public changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.authService.changePassword(req.body);
        res.status(result.statusCode).json(result);
    });

    public createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imagePath = files?.["image"]?.[0]?.path;
        const ticketImagePath = files?.["ticketImage"]?.[0]?.path;

        const result = await this.authService.createUser(req.body, imagePath, ticketImagePath);
        res.status(result.statusCode).json(result);
    });
}
