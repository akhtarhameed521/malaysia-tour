import { Router } from "express";
import { AirlineController } from "./airline.controller";
import { memoryUpload } from "../common/provider/multer.provider";
import { validateRequest } from "../common/middlewares/validation.middleware";
import { 
    CreateAirlineSchema, 
    UpdateAirlineSchema, 
    CreateReturnAirlineSchema, 
    UpdateReturnAirlineSchema 
} from "./dto/airline.dto";

export class AirlineRoute {
    public router: Router;
    private airlineController: AirlineController;

    constructor() {
        this.router = Router();
        this.airlineController = new AirlineController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Airline Routes
        this.router.post("/", validateRequest(CreateAirlineSchema), this.airlineController.createAirline);
        this.router.post("/return", validateRequest(CreateReturnAirlineSchema), this.airlineController.createReturnAirline);
        this.router.get("/", this.airlineController.getAllAirlines);
        this.router.get("/return", this.airlineController.getAllReturnAirlines);
        this.router.get("/:id", this.airlineController.getAirlineOne);
        this.router.put("/:id", validateRequest(UpdateAirlineSchema), this.airlineController.updateAirline);
        this.router.delete("/:id", this.airlineController.deleteAirline);
        this.router.post("/bulk-upload", memoryUpload.single("file"), this.airlineController.bulkUploadAirlines);

        // Return Airline Routes
        this.router.post("/return/bulk-upload", memoryUpload.single("file"), this.airlineController.bulkUploadReturnAirlines);
        this.router.get("/return/:id", this.airlineController.getReturnAirlineOne);
        this.router.put("/return/:id", validateRequest(UpdateReturnAirlineSchema), this.airlineController.updateReturnAirline);
        this.router.delete("/return/:id", this.airlineController.deleteReturnAirline);
    }
}
