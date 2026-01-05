import { Router } from "express";
import { Users } from "../entities/User";
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import { validatePassword } from "../utiles/passwordUtils";
import crypto from "crypto";
import dotenv from 'dotenv';
import { isAdmin } from "../utiles/roleUtils";
import { Not } from "typeorm";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import ejs from "ejs";
import path from "path";
import { generateOTP } from "../utiles/OTPUtils";
import { AppDataSource } from "../datasource"; 

dotenv.config(); 

const router = Router();

// Store invalid fields
const addInvalidField = (fields: string[], fieldName: string) => {
    if (!fields.includes(fieldName)) {
        fields.push(fieldName);
    }
};

// SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// -------------------- ROUTES --------------------

// POST /login → User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const invalidFields: string[] = [];

    if (!email) invalidFields.push("email");
    if (!password) invalidFields.push("password");
    if (invalidFields.length) {
        return res.status(400).json({ message: "Missing fields!", invalid: invalidFields });
    }

    try {
        const user = await AppDataSource
            .getRepository(Users)
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // 2FA
        const otp = generateOTP();
        user.twoFactorCode = await bcrypt.hash(otp, 10);
        user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000);

        await AppDataSource.getRepository(Users).save(user);

        await transporter.sendMail({
            from: `"Ordo" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Your verification code",
          html: await ejs.renderFile(path.join(__dirname, '../../views/2fa.ejs'), { otp, user }),
        });

        res.status(200).json({
            message: "Verification code sent to email",
            twoFactorRequired: true,
            userId: user.id
        });
    } catch (error) {
        console.error("POST /login error:", error);
        res.status(500).json({ message: "Error during login." });
    }
});

// POST /verify-2fa → Verify 2FA Code
router.post("/verify-2fa", async (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ message: "Missing fields!" });

    try {
        const user = await AppDataSource.getRepository(Users).findOne({ where: { id: userId } });
        if (!user || !user.twoFactorCode || !user.twoFactorExpires) return res.status(400).json({ message: "Invalid verification attempt!" });

        if (user.twoFactorExpires < new Date()) return res.status(400).json({ message: "Verification code expired!" });

        const valid = await bcrypt.compare(code, user.twoFactorCode);
        if (!valid) return res.status(400).json({ message: "Invalid verification code!" });

        // 2FA törlése
        user.twoFactorCode = null;
        user.twoFactorExpires = null;
        await AppDataSource.getRepository(Users).save(user);

        res.status(200).json({
            message: "Login successful",
            token: generateToken({ id: user.id, email: user.email, name: user.name, role: user.role }),
            user: { id: user.id, email: user.email, role: user.role, name: user.name }
        });
    } catch (error) {
        console.error("POST /verify-2fa error:", error);
        res.status(500).json({ message: "Error verifying 2FA code." });
    }
});

// GET / → Get All Users (admin only)
router.get('/', tokencheck, isAdmin, async (req, res) => {
    try {
        const users = await AppDataSource.getRepository(Users).find({
            select: ["id", "name", "email", "role"]
        });
        res.json({ users });
    } catch (error) {
        console.error("GET / error:", error);
        res.status(500).json({ error: 'Error fetching users.' });
    }
});

// GET /users/:id → Get User by ID
router.get('/users/:id', tokencheck, async (req:any, res:any) => {
    const { id } = req.params;
    const requestingUserId = req.user.id;
    const isUserAdmin = req.user.role === "ADMIN";

    if (!isUserAdmin && requestingUserId !== id) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const user = await AppDataSource.getRepository(Users).findOne({
            where: { id },
            select: ["id", "name", "email", "role"]
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        console.error("GET /users/:id error:", error);
        res.status(500).json({ error: 'Error fetching user.' });
    }
});

// PATCH /:id → Update User Data (partial) with password change
router.patch('/:id', tokencheck, async (req: any, res: any) => {
    const userId = req.params.id;
    const requestingUserId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    const { name, email, role, currentPassword, newPassword } = req.body;

    // Csak saját magát vagy admin módosíthat
    if (userId !== requestingUserId && !isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        // ⚠️ password miatt QueryBuilder kell
        const user = await AppDataSource
            .getRepository(Users)
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.id = :id", { id: userId })
            .getOne();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Name update
        if (name) {
            user.name = name;
        }

        // Email update
        if (email) {
            const emailConflict = await AppDataSource
                .getRepository(Users)
                .findOne({ where: { email, id: Not(userId) } });

            if (emailConflict) {
                return res.status(400).json({
                    message: "Email already exists",
                    invalid: ["email"],
                });
            }

            user.email = email;
        }

        // Role update – ONLY ADMIN
        if (role) {
            if (!isAdmin) {
                return res.status(403).json({ error: "Only admin can change role" });
            }

            if (!["ADMIN", "USER", "HELPDESK"].includes(role)) {
                return res.status(400).json({
                    message: "Invalid role",
                    invalid: ["role"],
                });
            }

            user.role = role;
        }

        // Password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    message: "Current password required",
                    invalid: ["currentPassword"],
                });
            }

            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(400).json({
                    message: "Current password is incorrect",
                    invalid: ["currentPassword"],
                });
            }

            if (!validatePassword(newPassword)) {
                return res.status(400).json({
                    message: "New password does not meet requirements",
                    invalid: ["newPassword"],
                });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        await AppDataSource.getRepository(Users).save(user);

        res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("PATCH /:id error:", error);
        res.status(500).json({ message: "Error updating user" });
    }
});

// DELETE /:id → Delete User
router.delete('/:id', tokencheck, async (req:any, res:any) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isUserAdmin = req.user.role === "ADMIN";

    if (userId !== id && !isUserAdmin) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const user = await AppDataSource.getRepository(Users).findOne({ where: { id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        await AppDataSource.getRepository(Users).delete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("DELETE /:id error:", error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const user = await AppDataSource.getRepository(Users).findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = await bcrypt.hash(resetToken, 10);
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

        await AppDataSource.getRepository(Users).save(user);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
        const mailOptions = {
            from: `"TrackIt" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: await ejs.renderFile(path.join(__dirname, '../../views/reset-password.ejs'), { resetUrl, user, resetToken }),
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("POST /forgot-password error:", error);
        res.status(500).json({ message: "Error sending email" });
    }
});


export default router;
