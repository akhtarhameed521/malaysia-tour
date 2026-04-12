import { Router } from "express";
import { GroupController } from "./group.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateGroupSchema, UpdateGroupSchema } from "./dto/group.dto";

export class GroupRoute {
    public router: Router;
    private groupController: GroupController;

    constructor() {
        this.router = Router();
        this.groupController = new GroupController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.groupController.getAll);
        this.router.get("/:id", this.groupController.getOne);
        this.router.post("/", validateRequest(CreateGroupSchema), this.groupController.create);
        this.router.put("/:id", validateRequest(UpdateGroupSchema), this.groupController.update);
        this.router.delete("/:id", this.groupController.delete);
    }
}
