import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entities/User";
import dotenv from "dotenv";

dotenv.config(); 

// ENV ellenőrzés
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET nincs definiálva a .env fájlban!");

// JWT payload típus
export interface AuthTokenPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Token generálás
export const generateToken = (user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}) => {
  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

// Típusos request
export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

// Middleware token ellenőrzéshez
export const tokencheck = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Nincs megadva vagy hibás Authorization fejléc!" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = decoded; // a decoded payload mindig AuthTokenPayload típusú
    next();
  } catch (err) {
    console.error("JWT ellenőrzési hiba:", err);
    return res.status(401).json({ message: "Érvénytelen vagy lejárt token!" });
  }
};
