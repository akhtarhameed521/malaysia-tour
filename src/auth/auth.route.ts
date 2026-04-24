import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { 
    LoginUserSchema, 
    ChangePasswordSchema,
    CreateUserSchema,
} from "./dto/auth.dto";
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
            "/create-user",
            upload.fields([
                { name: "image", maxCount: 1 },
                { name: "ticketImage", maxCount: 1 }
            ]),
            validateRequest(CreateUserSchema),
            this.authController.createUser
        );

        this.router.post(
            "/login",
            validateRequest(LoginUserSchema),
            this.authController.login
        );

        this.router.post(
            "/change-password",
            validateRequest(ChangePasswordSchema),
            this.authController.changePassword
        );
    }
}
