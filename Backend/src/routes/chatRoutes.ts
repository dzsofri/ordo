import { Router } from "express";
import { Chat } from "../entities/Chat";
import { tokencheck, AuthRequest } from "../utiles/tokenUtils";
import { Users } from "../entities/User";
import { AppDataSource } from "../datasource"; 
import fs from "fs";
import path from "path";

const router = Router();

// 🔹 FAQ betöltése külső JSON-ból
const faqPath = path.join(__dirname, "../utiles/faq.json");
let faq: { keywords: string[]; answer: string }[] = [];

try {
  const data = fs.readFileSync(faqPath, "utf8");
  faq = JSON.parse(data);
} catch (err) {
  console.error("FAQ betöltése sikertelen:", err);
}

// 🔹 Üzenet küldés
router.post("/send", tokencheck, async (req: AuthRequest, res) => {
  const senderId = req.user!.id;
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ message: "Hiányzó mezők" });
  }

  const userRepo = AppDataSource.getRepository(Users);
  const chatRepo = AppDataSource.getRepository(Chat);

  const sender = await userRepo.findOne({ where: { id: senderId } });
  const receiver = await userRepo.findOne({ where: { id: receiverId } });

  if (!receiver || !sender) {
    return res.status(404).json({ message: "Felhasználó nem található" });
  }

  // 🔹 Eredeti felhasználói üzenet mentése
  const chat = new Chat();
  chat.sender = sender;
  chat.receiver = receiver;
  chat.message = message;
  await chatRepo.save(chat);

  // 🔹 Kulcsszó-alapú automatizált válasz keresése
  const lowerMessage = message.toLowerCase();
  const autoAnswer = faq.find(f =>
    f.keywords.some(k => lowerMessage.includes(k.toLowerCase()))
  );

  if (autoAnswer) {
    // 🔹 Bot user (előre létrehozott)
    const botUser = await userRepo.findOne({ where: { email: "bot@helpdesk.com" } });
    if (botUser) {
      const botMessage = new Chat();
      botMessage.sender = botUser;
      botMessage.receiver = sender;
      botMessage.message = autoAnswer.answer;
      await chatRepo.save(botMessage);
    }
    return res.status(201).json({ message: "Üzenet elküldve, automatikus válasz küldve" });
  }

  // 🔹 Ha nincs automatikus válasz → human fallback
  return res.status(201).json({ message: "Üzenet elküldve, helpdesk hamarosan válaszol" });
});

// 🔹 Két felhasználó üzenetei
router.get("/messages/:user2Id", tokencheck, async (req: AuthRequest, res) => {
  const user1Id = req.user!.id;
  const { user2Id } = req.params;

  const chatRepo = AppDataSource.getRepository(Chat);

  const messages = await chatRepo.find({
    where: [
      { sender: { id: user1Id }, receiver: { id: user2Id } },
      { sender: { id: user2Id }, receiver: { id: user1Id } }
    ],
    order: { createdAt: "ASC" }
  });

  res.json(messages);
});

export default router;
