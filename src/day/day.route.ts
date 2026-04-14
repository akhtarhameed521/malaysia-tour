import { Router } from "express";
import { DayController } from "./day.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateDaySchema, UpdateDaySchema } from "./dto/day.dto";

export class DayRoute {
    public router: Router;
    private dayController: DayController;

    constructor() {
        this.router = Router();
        this.dayController = new DayController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", validateRequest(CreateDaySchema), this.dayController.create);
        this.router.get("/", this.dayController.getAll);
        this.router.get("/:id", this.dayController.getOne);
        this.router.put("/:id", validateRequest(UpdateDaySchema), this.dayController.update);
        this.router.delete("/:id", this.dayController.delete);
    }
}
