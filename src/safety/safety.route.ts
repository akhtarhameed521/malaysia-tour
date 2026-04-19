import { Router } from "express";
import { SafetyController } from "./safety.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateSafetySchema, UpdateSafetySchema } from "./dto/safety.dto";

export class SafetyRoute {
    public router: Router;
    private safetyController: SafetyController;

    constructor() {
        this.router = Router();
        this.safetyController = new SafetyController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", validateRequest(CreateSafetySchema), this.safetyController.create);
        this.router.get("/", this.safetyController.getAll);
        this.router.get("/:id", this.safetyController.getOne);
        this.router.put("/:id", validateRequest(UpdateSafetySchema), this.safetyController.update);
        this.router.delete("/:id", this.safetyController.delete);
    }
}
