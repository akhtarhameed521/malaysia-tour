import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "./employee.service";
import { asyncHandler } from "../common/helper/async-handler.helper";

export class EmployeeController {
    private employeeService: EmployeeService;

    constructor() {
        this.employeeService = new EmployeeService();
    }

    getAllEmployees = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const groupId = req.query.groupId as string;
        const result = await this.employeeService.getAllEmployees(page, limit, groupId);
        res.status(result.statusCode).json(result);
    });

    getEmployeeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const result = await this.employeeService.getEmployeeById(Number(id));
        res.status(result.statusCode).json(result);
    });

    getEmployeeByEmployeeId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { eid } = req.params;
        const result = await this.employeeService.getEmployeeByEmployeeId(eid);
        res.status(result.statusCode).json(result);
    });

    updateEmployee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imagePath = files?.["image"]?.[0]?.path;
        const ticketImagePath = files?.["ticketImage"]?.[0]?.path;

        const result = await this.employeeService.updateEmployee(Number(id), req.body, imagePath, ticketImagePath);
        res.status(result.statusCode).json(result);
    });

    deleteEmployee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const result = await this.employeeService.deleteEmployee(Number(id));
        res.status(result.statusCode).json(result);
    });
}
