import { Router } from "express";
import { ExploreController } from "./explore.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateExploreSchema, UpdateExploreSchema } from "./dto/explore.dto";

export class ExploreRoute {
    public router: Router;
    private exploreController: ExploreController;

    constructor() {
        this.router = Router();
        this.exploreController = new ExploreController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", validateRequest(CreateExploreSchema), this.exploreController.create);
        this.router.get("/", this.exploreController.getAll);
        this.router.get("/:id", this.exploreController.getOne);
        this.router.put("/:id", validateRequest(UpdateExploreSchema), this.exploreController.update);
        this.router.delete("/:id", this.exploreController.delete);
    }
}
