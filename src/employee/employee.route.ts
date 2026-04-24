import { Router } from "express";
import { EmployeeController } from "./employee.controller";
import { upload, memoryUpload } from "../common/provider/multer.provider";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { AdminChangePasswordSchema } from "../auth/dto/auth.dto";

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
        this.router.post("/bulk-upload", memoryUpload.single("file"), this.employeeController.bulkUpload);
        this.router.post("/sync-groups", this.employeeController.syncGroups);
        
      
        this.router.post(
            "/change-password", 
            validateRequest(AdminChangePasswordSchema), 
            this.employeeController.adminChangePassword
        );

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
