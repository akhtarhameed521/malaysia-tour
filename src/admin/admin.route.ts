import { Router } from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateAdminSchema, UpdateAdminSchema, LoginAdminSchema } from "./dto/admin.dto";
import { upload } from "../common/provider/multer.provider";

export class AdminRoute {
    public router: Router;
    private adminController: AdminController;

    constructor() {
        this.router = Router();
        this.adminController = new AdminController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/login",
            validateRequest(LoginAdminSchema),
            this.adminController.loginAdmin
        );
        this.router.post(
            "/",
            validateRequest(CreateAdminSchema),
            this.adminController.createAdmin
        );
        this.router.get("/", this.adminController.getAllAdmins);
        this.router.get("/:id", this.adminController.getAdminById);
        this.router.put(
            "/:id",
            validateRequest(UpdateAdminSchema),
            this.adminController.updateAdmin
        );
        this.router.delete("/:id", this.adminController.deleteAdmin);
    }
}
