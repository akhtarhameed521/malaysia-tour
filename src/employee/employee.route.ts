import { Router } from "express";
import { EmployeeController } from "./employee.controller";
import { upload } from "../common/provider/multer.provider";

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
        this.router.get("/:id", this.employeeController.getEmployeeById);
        this.router.get("/eid/:eid", this.employeeController.getEmployeeByEmployeeId);
        this.router.put(
            "/:id",
            upload.fields([
                { name: "image", maxCount: 1 },
                { name: "ticketImage", maxCount: 1 }
            ]),
            this.employeeController.updateEmployee
        );
        this.router.delete("/:id", this.employeeController.deleteEmployee);
    }
}
