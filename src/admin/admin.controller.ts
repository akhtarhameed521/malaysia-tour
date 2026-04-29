import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    public loginAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.adminService.loginAdmin(req.body);
        res.status(result.statusCode).json(result);
    });

    public createAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;
        const result = await this.adminService.createAdmin(req.body, file);
        res.status(result.statusCode).json(result);
    });

    public getAllAdmins = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const result = await this.adminService.getAllAdmins(page, limit);
        res.status(result.statusCode).json(result);
    });

    public getAdminById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const result = await this.adminService.getAdminById(id);
        res.status(result.statusCode).json(result);
    });

    public updateAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const file = req.file;
        const result = await this.adminService.updateAdmin(id, req.body, file);
        res.status(result.statusCode).json(result);
    });

    public deleteAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const result = await this.adminService.deleteAdmin(id);
        res.status(result.statusCode).json(result);
    });
}
