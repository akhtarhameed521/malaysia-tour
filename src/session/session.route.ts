import { Router } from "express";
import { SessionController } from "./session.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateSessionSchema, UpdateSessionSchema } from "./dto/session.dto";
import { upload } from "../common/provider/multer.provider";

export class SessionRoute {
    public router: Router;
    private sessionController: SessionController;

    constructor() {
        this.router = Router();
        this.sessionController = new SessionController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/me", this.sessionController.getSessionsByMe);
        
        this.router.post("/bulk-upload", upload.single('file'), this.sessionController.bulkUpload);
        this.router.post("/", validateRequest(CreateSessionSchema), this.sessionController.create);
        this.router.get("/", this.sessionController.getAll);
        this.router.get("/:id", this.sessionController.getOne);
        this.router.put("/:id", validateRequest(UpdateSessionSchema), this.sessionController.update);
        this.router.delete("/:id", this.sessionController.delete);
    }
}
