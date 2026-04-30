import { Router } from "express";
import { RoomController } from "./room.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { memoryUpload } from "../common/provider/multer.provider";
import { CreateRoomSchema, UpdateRoomSchema } from "./dto/room.dto";

export class RoomRoute {
    public router: Router;
    private roomController: RoomController;

    constructor() {
        this.router = Router();
        this.roomController = new RoomController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", validateRequest(CreateRoomSchema), this.roomController.create);
        this.router.get("/", this.roomController.getAll);
        this.router.get("/:id", this.roomController.getOne);
        this.router.put("/:id", validateRequest(UpdateRoomSchema), this.roomController.update);
        this.router.delete("/:id", this.roomController.delete);
        this.router.post("/bulk-upload", memoryUpload.single("file"), this.roomController.bulkUpload);
    }
}
