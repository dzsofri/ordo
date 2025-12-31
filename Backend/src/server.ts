import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import "reflect-metadata";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import eventRoutes from "./routes/eventRoutes";
import { AppDataSource } from "./datasource";

dotenv.config();

const app = express();

// SSL beállítások (self-signed vagy Let's Encrypt)
const sslOptions = {
  key: fs.readFileSync("C:/Users/Zsófi/Desktop/ordo/Backend/private.key"),
  cert: fs.readFileSync("C:/Users/Zsófi/Desktop/ordo/Backend/certificate.crt"),
};


const server = https.createServer(sslOptions, app);

const io = new Server(server, {
  cors: {
    origin: "https://localhost:4200", // frontend URL, HTTPS
    methods: ["GET", "POST"],
  },
});

/* ================================
   SOCKET.IO – ONLINE STATUS + CHAT
================================ */

const usersOnline: Record<string, string> = {};

io.on("connection", (socket) => {
  socket.on("joinPrivateRoom", (userId: string) => {
    socket.join(userId);
    usersOnline[userId] = socket.id;
    io.emit("userStatusChanged", { userId, status: "online" });
  });

  socket.on("privateMessage", (msg) => {
    socket.to(msg.receiverId).emit("messageReceived", msg);
  });

  socket.on("disconnect", () => {
    for (const uid in usersOnline) {
      if (usersOnline[uid] === socket.id) {
        io.emit("userStatusChanged", {
          userId: uid,
          status: "offline",
        });
        delete usersOnline[uid];
        break;
      }
    }
  });
});

/* ================================
   MIDDLEWARE + ROUTES
================================ */

app.use(cors({ origin: "https://localhost:4200" }));
app.use(express.json());

app.use("/users", userRoutes);
app.use("/chat", chatRoutes);
app.use("/events", eventRoutes);

/* ================================
   SERVER + DB INIT
================================ */

const PORT = process.env.PORT || 3000;

async function initServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    server.listen(PORT, () =>
      console.log(`Server running on https://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
}

initServer();
