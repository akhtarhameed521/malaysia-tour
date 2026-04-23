import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { registerChatSocket } from "../chat/chat.socket";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true
        }
    });

    // Register chat socket handlers
    registerChatSocket(io);

    console.log("Socket.io initialized successfully.");
    return io;
};

export const getIo = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
