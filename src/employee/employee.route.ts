import { Router } from "express";
import { EmployeeController } from "./employee.controller";

export class EmployeeRoute {
    public router: Router;
    private employeeController: EmployeeController;

    constructor() {
        this.router = Router();
        this.employeeController = new EmployeeController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.employeeController.getAllEmployees);
    }
}
