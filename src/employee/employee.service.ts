import AppDataSource from "../config/db-config";
import { EmployeeEntity } from "../entities/employee.entity";
import { ApiResponse } from "../common/helper/api-success.helper";
import { statusCode } from "../common/messages/status-code.messages";
import { Not } from "typeorm";
import { StatusEnum } from "../types";

export class EmployeeService {
    private employeeRepository = AppDataSource.getRepository(EmployeeEntity);

    async getAllEmployees(page: number = 1, limit: number = 10): Promise<ApiResponse<EmployeeEntity[]>> {
        const [employees, total] = await this.employeeRepository.findAndCount({
            where: {
                status: Not(StatusEnum.Deactivate)
            },
            skip: (page - 1) * limit,
            take: limit
        });

        const lastPage = Math.ceil(total / limit);
        return new ApiResponse(statusCode.OK, employees, "Employees retrieved successfully", page, total, lastPage);
    }
}
