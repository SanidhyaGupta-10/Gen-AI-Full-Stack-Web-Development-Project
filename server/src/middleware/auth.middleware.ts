import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenBlacklist from "../models/blacklist.model";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if token is blacklisted
        const isBlacklisted = await tokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
        // Attach user to request
        (req as any).user = (decodedToken as { user: { id: string } }).user;

        // Call next middleware
        next();
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
};