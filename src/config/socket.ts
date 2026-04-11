import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    console.log("Socket.io initialized successfully.");
    return io;
};

export const getIo = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
