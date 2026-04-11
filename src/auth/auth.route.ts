import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { 
    LoginUserSchema, 
    ChangePasswordSchema,
    CreateEmployeeSchema,
    RegisterUserSchema
} from "./dto/auth.dto";
import { authenticateToken } from "../common/middlewares/auth.middleware";
import { upload } from "../common/provider/multer.provider";

export class AuthRoute {
    public router: Router;
    private authController: AuthController;

    constructor() {
        this.router = Router();
        this.authController = new AuthController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/employee",
            validateRequest(CreateEmployeeSchema),
            this.authController.createEmployee
        );

        this.router.post(
            "/register",
            upload.single("image"),
            validateRequest(RegisterUserSchema),
            this.authController.registerUser
        );

        this.router.post(
            "/login",
            validateRequest(LoginUserSchema),
            this.authController.login
        );

        this.router.post(
            "/change-password",
            authenticateToken,
            validateRequest(ChangePasswordSchema),
            this.authController.changePassword
        );
    }
}
