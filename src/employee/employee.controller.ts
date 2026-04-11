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
        const result = await this.employeeService.getAllEmployees(page, limit);
        res.status(result.statusCode).json(result);
    });
}
