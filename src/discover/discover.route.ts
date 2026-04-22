import { Router } from "express";
import { DiscoverController } from "./discover.controller";

export class DiscoverRoute {
    public router: Router;
    private discoverController: DiscoverController;

    constructor() {
        this.router = Router();
        this.discoverController = new DiscoverController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.discoverController.getDiscover);
    }
}
