import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from "../models/user.model";
import tokenBlacklist from "../models/blacklist.model";

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
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({ name, email, password: hashedPassword });

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        // Set cookie
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 3600000 });

        // Send response
        res.status(201).json({ user, token });
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists or not
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

        // Set cookie
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 3600000 });

        // Send response
        res.status(200).json({ user, token });
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
};

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

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user?.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ error: error?.message });
    }
};