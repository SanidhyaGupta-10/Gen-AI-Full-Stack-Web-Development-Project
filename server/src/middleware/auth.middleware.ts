import type { NextFunction, Request, Response } from "express";
import tokenBlacklist from "../models/blacklist.model";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if token is blacklisted
        const isBlacklisted = await tokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify token
        let decodedToken;
        try {
            decodedToken = verifyToken(token);
        } catch (verifyError: any) {
            console.warn(`[Auth] Token verification failed: ${verifyError.message}`);
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // Attach user to request
        (req as any).user = decodedToken;

        // Call next middleware
        next();
    } catch (error: any) {
        console.error("[Auth] Unexpected error in auth middleware:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};