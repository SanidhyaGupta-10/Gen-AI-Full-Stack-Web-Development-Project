import type { Request, Response } from "express";
import User from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import tokenBlacklist from "../models/blacklist.model";

/**
 * POST /api/auth/register
 * @description Register a new user with name, email and password
 * @access Public
 */

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Ensure the old 'name' unique index is dropped so users can share names
        try {
            await User.collection.dropIndex("name_1");
        } catch (e) {
            // Ignore if index doesn't exist
        }

        // Create user
        const user = await User.create({ name, email, password: hashedPassword });

        // Generate token
        const token = generateToken(String(user._id));

        // Set cookie
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 3600000 });

        // Send response
        res.status(201).json({ user, token });
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
};

/**
 * POST /api/auth/login
 * @description Authenticate user with email and password, return JWT token
 * @access Public
 */

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists or not
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate token
        const token = generateToken(String(user._id));

        // Set cookie
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 3600000 });

        // Send response
        res.status(200).json({ user, token });
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
};

/**
 * POST /api/auth/logout
 * @description Logout current user and blacklist the JWT token
 * @access Private
 */

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token;
        if (token) {
            await tokenBlacklist.create({ token });
        }
        // Clear cookie
        res.clearCookie("token");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
};

/**
 * GET /api/auth/get-me
 * @description Get current authenticated user's profile details
 * @access Private
 */

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            console.error("[Auth] getMe called but no user ID found in request object");
            return res.status(401).json({ error: "User context missing" });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[Auth] User with ID ${userId} not found in database`);
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error: any) {
        console.error("[Auth] Error in getMe controller:", error);
        res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
};
