import { Router } from "express";
import { Events } from "../entities/Event";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";
import { isAdmin } from "../utiles/roleUtils";
import { AppDataSource } from "../datasource"; 

const router = Router();

// POST /events → Create Event
router.post("/", tokencheck, async (req: any, res) => {
    const { title, occurrence, description } = req.body;

    if (!title || !occurrence) {
        return res.status(400).json({
            message: "Missing fields!",
            invalid: [
                !title && "title",
                !occurrence && "occurrence"
            ].filter(Boolean),
        });
    }

    try {
        const eventRepo = AppDataSource.getRepository(Events);
        const userRepo = AppDataSource.getRepository(Users);

        const user = await userRepo.findOneBy({ id: req.user.id });
        if (!user) return res.status(404).json({ error: "User not found." });

        const event = eventRepo.create({
            title,
            occurrence: new Date(occurrence),
            description: description ?? null,
            user,
        });

        await eventRepo.save(event);
        res.status(201).json({ message: "Event created.", event });
    } catch (err) {
        res.status(500).json({ error: "Error creating event." });
    }
});

// GET /events/all → Get All Events (Admin)
router.get("/all", tokencheck, isAdmin, async (req: any, res) => {
    try {
        const events = await AppDataSource.getRepository(Events).find({
            relations: ["user"],
        });
        res.json({ events });
    } catch (err) {
        res.status(500).json({ error: "Error fetching events." });
    }
});

// GET /events → Get Logged-in User Events
router.get("/", tokencheck, async (req: any, res) => {
    try {
        const events = await AppDataSource.getRepository(Events).find({
            where: { user: { id: req.user.id } },
        });
        res.json({ events });
    } catch (err) {
        res.status(500).json({ error: "Error fetching events." });
    }
});

// GET /events/:id → Get Event By ID
router.get("/:id", tokencheck, async (req: any, res) => {
    try {
        const event = await AppDataSource.getRepository(Events).findOne({
            where: {
                id: req.params.id,
                user: { id: req.user.id },
            },
        });

        if (!event) return res.status(404).json({ error: "Event not found." });
        res.json({ event });
    } catch (err) {
        res.status(500).json({ error: "Error fetching event." });
    }
});

// PUT /events/:id → Update Event
router.put("/:id", tokencheck, async (req: any, res) => {
    const { title, occurrence, description } = req.body;

    try {
        const repo = AppDataSource.getRepository(Events);

        const event = await repo.findOne({
            where: {
                id: req.params.id,
                user: { id: req.user.id },
            },
        });

        if (!event) return res.status(404).json({ error: "Event not found." });

        if (title !== undefined) event.title = title;
        if (occurrence !== undefined) event.occurrence = new Date(occurrence);
        if (description !== undefined) event.description = description;

        await repo.save(event);
        res.json({ message: "Event updated.", event });
    } catch (err) {
        res.status(500).json({ error: "Error updating event." });
    }
});

// DELETE /events/:id → Delete Event
router.delete("/:id", tokencheck, async (req: any, res) => {
    try {
        const repo = AppDataSource.getRepository(Events);

        const event = await repo.findOne({
            where: {
                id: req.params.id,
                user: { id: req.user.id },
            },
        });

        if (!event) return res.status(404).json({ error: "Event not found." });

        await repo.remove(event);
        res.json({ message: "Event deleted." });
    } catch (err) {
        res.status(500).json({ error: "Error deleting event." });
    }
});

export default router;
