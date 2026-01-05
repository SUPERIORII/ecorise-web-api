import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

let io;

export const initSocket = (server) => {
  const allowedOrigins = ["http://localhost:3000"];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //STANDARD HTTP METHODS
    },
  });

  io.on("connection", (socket) => {
    const rawCookies = socket.handshake.headers.cookie;
    if (!rawCookies) return socket.disconnect();

    const cookies = cookie.parse(rawCookies);
    const token = cookies.accessToken;
    if (!token) return socket.disconnect();

    try {
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = user;
      console.log("🟢 Auth socket:", user.id);
    } catch {
      return socket.disconnect();
    }

    socket.on("disconnect", () => {
      console.log("🔴 client disconnected", socket.id);
    });
  });

  return io;
};

export const getIO = () => io;
