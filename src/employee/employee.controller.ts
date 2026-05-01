import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "./employee.service";
import { asyncHandler } from "../common/helper/async-handler.helper";
import { ApiError } from "../common/helper/api-error.helper";
import { statusCode } from "../common/messages/status-code.messages";

export class EmployeeController {
    private employeeService: EmployeeService;

    constructor() {
        this.employeeService = new EmployeeService();
    }

    getAllEmployees = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
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

    adminChangePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.employeeService.adminChangePassword(req.body);
        res.status(result.statusCode).json(result);
    });

    deleteEmployee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const result = await this.employeeService.deleteEmployee(Number(id));
        res.status(result.statusCode).json(result);
    });

    bulkUpload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;
        if (!file) {
            throw new ApiError(statusCode.BadRequest, "No file uploaded");
        }
        const result = await this.employeeService.bulkUpload(file.buffer);
        res.status(result.statusCode).json(result);
    });

    bulkUploadMissing = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;
        if (!file) {
            throw new ApiError(statusCode.BadRequest, "No file uploaded");
        }
        const result = await this.employeeService.bulkUploadMissing(file.buffer);
        res.status(result.statusCode).json(result);
    });

    bulkUpdate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;
        if (!file) {
            throw new ApiError(statusCode.BadRequest, "No file uploaded");
        }
        const result = await this.employeeService.bulkUpdate(file.buffer);
        res.status(result.statusCode).json(result);
    });

    syncGroups = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.employeeService.syncGroups();
        res.status(result.statusCode).json(result);
    });

    assignGroup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { employeeId, groupId } = req.body;
        if (!employeeId || !groupId) {
            throw new ApiError(statusCode.BadRequest, "employeeId and groupId are required");
        }
        const result = await this.employeeService.assignGroup(employeeId, Number(groupId));
        res.status(result.statusCode).json(result);
    });

    removeGroup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { employeeId } = req.body;
        if (!employeeId) {
            throw new ApiError(statusCode.BadRequest, "employeeId is required");
        }
        const result = await this.employeeService.removeGroup(employeeId);
        res.status(result.statusCode).json(result);
    });
}
