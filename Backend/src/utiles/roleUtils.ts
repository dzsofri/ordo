import { Response, NextFunction } from "express";
import { Users, UserRole } from "../entities/User";
import { AppDataSource } from "../datasource"; // egyetlen DataSource
import { AuthRequest } from "./tokenUtils";

export const hasRole = (allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) 
      return res.status(401).json({ message: "Nem hitelesített felhasználó." });

    let role = req.user.role;

    // Ha nincs role a tokenben, lekérjük az adatbázisból
    if (!role) {
      const user = await AppDataSource.getRepository(Users).findOne({ 
        where: { id: req.user.id }, 
        select: ["role"] 
      });
      if (!user) return res.status(404).json({ message: "Felhasználó nem található." });
      role = user.role;
      req.user.role = role;
    }

    if (!allowedRoles.includes(role)) 
      return res.status(403).json({ message: "Hozzáférés megtagadva." });

    next();
  };
};

// Middleware-ek
export const isAdmin = hasRole([UserRole.ADMIN]);
export const isHelpdesk = hasRole([UserRole.HELPERSK]);
export const isAdminOrHelpdesk = hasRole([UserRole.ADMIN, UserRole.HELPERSK]);
