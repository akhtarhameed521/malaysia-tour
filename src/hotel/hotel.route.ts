import { Router } from "express";
import { HotelController } from "./hotel.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateHotelSchema, UpdateHotelSchema } from "./dto/hotel.dto";
import { upload } from "../common/provider/multer.provider";

export class HotelRoute {
    public router: Router;
    private hotelController: HotelController;

    constructor() {
        this.router = Router();
        this.hotelController = new HotelController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.hotelController.getAll);
        this.router.get("/:id", this.hotelController.getOne);
        this.router.post("/", upload.single("image"), validateRequest(CreateHotelSchema), this.hotelController.create);
        this.router.put("/:id", upload.single("image"), validateRequest(UpdateHotelSchema), this.hotelController.update);
        this.router.delete("/:id", this.hotelController.delete);
    }
}
