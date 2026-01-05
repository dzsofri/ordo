import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import "reflect-metadata";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes";
import eventRoutes from "./routes/eventRoutes";
import ticketChatRoutes from "./routes/ticketChatRoutes";
import { AppDataSource } from "./datasource";
import { Ticket } from "./entities/Ticket";
import { TicketMessage } from "./entities/TicketMessages";
import { Users } from "./entities/User";

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
    origin: "http://localhost:4200", // frontend URL, HTTPS
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ================================
   SOCKET.IO – ONLINE STATUS + CHAT
================================ */

const usersOnline: Record<string, string> = {};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 🔹 PRIVÁT CHAT
  socket.on("joinPrivateRoom", (userId: string) => {
    socket.join(userId);
    usersOnline[userId] = socket.id;
    io.emit("userStatusChanged", { userId, status: "online" });
  });

  socket.on("privateMessage", (msg) => {
    socket.to(msg.receiverId).emit("messageReceived", msg);
  });

  // 🔹 TICKET LIVE CHAT
  socket.on("joinTicketRoom", (ticketId: string) => {
    socket.join(ticketId);
    console.log(`Socket ${socket.id} joined ticket ${ticketId}`);
  });

  socket.on("sendTicketMessage", async ({ ticketId, userId, content }) => {
    if (!content) return;

    const userRepo = AppDataSource.getRepository(Users);
    const ticketRepo = AppDataSource.getRepository(Ticket);
    const messageRepo = AppDataSource.getRepository(TicketMessage);

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return;

    // Ticket lekérése
    let ticket = null;
    if (ticketId) {
      ticket = await ticketRepo.findOne({
        where: { id: ticketId },
        relations: ["owner", "assignedTo", "messages"],
      });
    }

    // Ha nincs ticket, létrehozás
    if (!ticket) {
      ticket = ticketRepo.create({
        title: `New ticket from user ${user.id}`,
        owner: user,
        status: "open",
      });
      await ticketRepo.save(ticket);
    }

    // Felhasználói üzenet mentése
    const userMessage = messageRepo.create({
      ticket,
      sender: user,
      content,
    });
    await messageRepo.save(userMessage);

    // Üzenet broadcast a ticket room-ban
    io.to(ticket.id).emit("ticketMessageReceived", {
      ticket: {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        ownerId: ticket.owner.id,
        assignedToId: ticket.assignedTo?.id ?? null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
    });
  });

  socket.on("disconnect", () => {
    for (const uid in usersOnline) {
      if (usersOnline[uid] === socket.id) {
        io.emit("userStatusChanged", { userId: uid, status: "offline" });
        delete usersOnline[uid];
        break;
      }
    }
  });
});

/* ================================
   MIDDLEWARE + ROUTES
================================ */

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

app.use("/users", userRoutes);
app.use("/tickets", ticketChatRoutes);
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
