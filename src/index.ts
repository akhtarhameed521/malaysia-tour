import "reflect-metadata";
import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import * as http from "http";
import path from "path";

dotenv.config();

import AppDataSource from "./config/db-config";
import { initializeSocket } from "./config/socket";
import { errorHandler } from "@middlewares/error-handler.middleware";
import { AuthRoute, AdminRoute, EmployeeRoute, HotelRoute, RoomRoute, GroupRoute, AirlineRoute, DayRoute, SessionRoute, ExploreRoute, SafetyRoute, DiscoverRoute, ChatRoute } from "./app";

const app = express();
const server = http.createServer(app);
initializeSocket(server);

(async () => {
  try {
    await AppDataSource.initialize();
    console.log("Connected to PostgreSQL with TypeORM");

    app.use(express.json({ limit: "50mb" }));
    app.use('/Uploads', express.static(path.join(process.cwd(), 'Uploads')));
    app.use(
      cors({
        origin: "*",
        methods: ["PUT", "POST", "GET", "DELETE", "PATCH"],
        credentials: true,
      })
    );

    const authRoute = new AuthRoute()
    const adminRoute = new AdminRoute()
    const employeeRoute = new EmployeeRoute()
    const hotelRoute = new HotelRoute()
    const roomRoute = new RoomRoute()
    const groupRoute = new GroupRoute()
    const airlineRoute = new AirlineRoute()
    const dayRoute = new DayRoute()
    const sessionRoute = new SessionRoute()
    const exploreRoute = new ExploreRoute()
    const safetyRoute = new SafetyRoute()
    const discoverRoute = new DiscoverRoute()
    const chatRoute = new ChatRoute()

   
    app.use('/api/auth', authRoute.router)
    app.use('/api/admin', adminRoute.router)
    app.use('/api/employees', employeeRoute.router)
    app.use('/api/hotel', hotelRoute.router)
    app.use('/api/room', roomRoute.router)
    app.use('/api/group', groupRoute.router)
    app.use('/api/airline', airlineRoute.router)
    app.use('/api/day', dayRoute.router)
    app.use('/api/session', sessionRoute.router)
    app.use('/api/explore', exploreRoute.router)
    app.use('/api/safety', safetyRoute.router)
    app.use('/api/discover', discoverRoute.router)
    app.use('/api/chat', chatRoute.router)


    app.use(errorHandler);

    const port = Number(process.env.PORT) || 3000;

    server.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Error connecting to database", error);
  }
})();