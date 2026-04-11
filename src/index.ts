import "reflect-metadata";
import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import * as http from "http";

dotenv.config();

import AppDataSource from "./config/db-config";
import { initializeSocket } from "./config/socket";
import { errorHandler } from "@middlewares/error-handler.middleware";
import { AuthRoute,  UserRoute, AdminRoute, EmployeeRoute } from "./app";

const app = express();
const server = http.createServer(app);
initializeSocket(server);

(async () => {
  try {
    await AppDataSource.initialize();
    console.log("Connected to PostgreSQL with TypeORM");

    app.use(express.json());
    app.use(
      cors({
        origin: "*",
        methods: ["PUT", "POST", "GET", "DELETE", "PATCH"],
        credentials: true,
      })
    );

    const authRoute = new AuthRoute()
    const userRoute = new UserRoute()
    const adminRoute = new AdminRoute()
    const employeeRoute = new EmployeeRoute()


   
    app.use('/api/auth', authRoute.router)
    app.use('/api/users', userRoute.router)
    app.use('/api/admin', adminRoute.router)
    app.use('/api/employees', employeeRoute.router)


    app.use(errorHandler);

    const port = Number(process.env.PORT) || 3000;

    server.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Error connecting to database", error);
  }
})();