import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { UpdateUserSchema } from "./dto/user.dto";

export class UserRoute {
    public router: Router;
    private userController: UserController;

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.userController.getAllUsers);
        this.router.get("/:id", this.userController.getUserById);

        this.router.put(
            "/:id",
            validateRequest(UpdateUserSchema),
            this.userController.updateUser
        );

        this.router.delete("/:id", this.userController.deleteUser);
    }
}
