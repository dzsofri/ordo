import { Server } from "socket.io";
import { AppDataSource } from "../datasource";
import { Ticket } from "../entities/Ticket";
import { TicketMessage } from "../entities/TicketMessages";
import { Users } from "../entities/User";
import fs from "fs";
import path from "path";
import router from "./userRoutes";

// 🔹 FAQ JSON betöltése
const faqPath = path.join(__dirname, "../utiles/faq.json");
let faqBotResponses: { keywords: string[]; answer: string }[] = [];
try {
  faqBotResponses = JSON.parse(fs.readFileSync(faqPath, "utf-8"));
} catch (err) {
  console.error("FAQ JSON betöltés hiba:", err);
}

export const initSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // 🔹 Join ticket room
    socket.on("joinTicket", async ({ ticketId, userId }) => {
      socket.join(ticketId);
      console.log(`User ${userId} joined ticket ${ticketId}`);
    });

    // 🔹 Új üzenet
    socket.on("sendMessage", async ({ ticketId, userId, content }) => {
      if (!content) return;

      const userRepo = AppDataSource.getRepository(Users);
      const ticketRepo = AppDataSource.getRepository(Ticket);
      const messageRepo = AppDataSource.getRepository(TicketMessage);

      const user = await userRepo.findOneBy({ id: userId });
      if (!user) return;

      // 🔹 Ticket lekérése vagy létrehozás
      let ticket = null;
      if (ticketId) {
        ticket = await ticketRepo.findOne({
          where: { id: ticketId },
          relations: ["owner", "assignedTo", "messages"],
        });
      }

      if (!ticket) {
        ticket = ticketRepo.create({
          title: `New ticket from user ${user.id}`,
          owner: user,
          status: "open",
        });
        await ticketRepo.save(ticket);
      }

      // 🔹 Kulcsszó ellenőrzés (bot válasz)
      let botAnswer: string | null = null;
      for (const faq of faqBotResponses) {
        for (const keyword of faq.keywords) {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            botAnswer = faq.answer;
            break;
          }
        }
        if (botAnswer) break;
      }

      // 🔹 Felhasználói üzenet mentése
      const userMessage = messageRepo.create({
        ticket,
        sender: user,
        content,
      });
      await messageRepo.save(userMessage);

      // 🔹 Bot válasz mentése, ha van
      let botMessage: TicketMessage | null = null;
      if (botAnswer) {
        botMessage = messageRepo.create({
          ticket,
          sender: null,
          content: botAnswer,
        });
        await messageRepo.save(botMessage);
      }

      // 🔹 Üzenetek broadcast a ticket room-ban
      io.to(ticket.id).emit("newMessage", {
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
        botMessage: botMessage
          ? {
              id: botMessage.id,
              content: botMessage.content,
              createdAt: botMessage.createdAt,
            }
          : null,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export default router;