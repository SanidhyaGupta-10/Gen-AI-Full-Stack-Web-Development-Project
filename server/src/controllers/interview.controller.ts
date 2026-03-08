import type { Request, Response } from "express";
import { generateInterviewReport } from "../services/ai.service";

export const createInterviewReport = async (req: Request, res: Response) => {
    try {
        const { resume, selfDescription, jobDescription } = req.body;

        if (!resume || !selfDescription || !jobDescription) {
            return res.status(400).json({ error: "Resume, self description, and job description are required" });
        }

        const report = await generateInterviewReport({ resume, selfDescription, jobDescription });

        res.status(201).json(report);
    } catch (error: any) {
        console.error("Error creating interview report:", error);
        res.status(500).json({ error: error?.message || "Internal server error" });
    }
};
