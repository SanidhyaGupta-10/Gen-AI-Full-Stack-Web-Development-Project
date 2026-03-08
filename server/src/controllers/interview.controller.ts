// @ts-ignore - pdf-parse v2.4.5 exports PDFParse but type resolution fails in some ESM setups
import { PDFParse } from 'pdf-parse';
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/types";
import { generateInterviewReport } from "../services/ai.service";
import interviewReportModel from '../models/interview.model';


export const interviewController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const resumeFile = req.file;
        if (!resumeFile) {
            return res.status(400).json({ error: "Resume file is required" });
        }

        // Parse PDF content
        const parser = new PDFParse({ data: resumeFile.buffer });
        const data = await parser.getText();
        const resumeContent = data.text;

    
        const { selfDescription, jobDescription, title } = req.body;

        if (!selfDescription || !jobDescription) {
            return res.status(400).json({ error: "Self description and job description are required" });
        }

        const interviewReportByAI = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        });

        // Save report to database
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            jobDescription,
            resume: resumeContent,
            selfDescription,
            title: title || "Interview Prep Report",
            ...interviewReportByAI
        });

        res.status(200).json(interviewReport);

    } catch (error: any) {
        console.error("Error creating interview report:", error);
        res.status(500).json({ error: error?.message || "Internal server error" });
    }
};
