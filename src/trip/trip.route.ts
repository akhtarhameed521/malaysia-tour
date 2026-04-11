import { Router } from "express";
import { TripController } from "./trip.controller";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { CreateHotelSchema, CreateRoomSchema, CreateMemberSchema, UpdateHotelSchema, UpdateRoomSchema, UpdateMemberSchema } from "./dto/trip.dto";
import { upload } from "../common/provider/multer.provider";

export class TripRoute {
    public router: Router;
    private tripController: TripController;

    constructor() {
        this.router = Router();
        this.tripController = new TripController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.tripController.getTrips);
        this.router.delete("/delete-all", this.tripController.deleteAllTrips);

        this.router.post("/hotel", validateRequest(CreateHotelSchema), this.tripController.createHotel);
        this.router.put("/hotel/:id", validateRequest(UpdateHotelSchema), this.tripController.updateHotel);
        this.router.delete("/hotel/:id", this.tripController.deleteHotel);

        this.router.post("/room", validateRequest(CreateRoomSchema), this.tripController.createRoom);
        this.router.put("/room/:id", validateRequest(UpdateRoomSchema), this.tripController.updateRoom);
        this.router.delete("/room/:id", this.tripController.deleteRoom);

        this.router.post("/member", upload.single("image"), validateRequest(CreateMemberSchema), this.tripController.createMember);
        this.router.put("/member/:id", upload.single("image"), validateRequest(UpdateMemberSchema), this.tripController.updateMember);
        this.router.delete("/member/:id", this.tripController.deleteMember);
    }
}
