// @ts-ignore - pdf-parse v2.4.5 exports PDFParse but type resolution may fail in some ESM setups
import { PDFParse } from "pdf-parse";
import { isValidObjectId } from "mongoose";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/types";
import { generateInterviewReport, generateResumePdf } from "../services/ai.service";
import interviewReportModel from "../models/interview.model";


/**
 * @description Generate interview report based on user self description, resume PDF and job description.
 * @route   POST /api/interview
 * @access  Private
 */
export const generateInterViewReportController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const resumeFile = req.file;
    if (!resumeFile) {
      res.status(400).json({ message: "Resume file is required." });
      return;
    }

    // Parse PDF → plain text
    const parser = new PDFParse({ data: Uint8Array.from(resumeFile.buffer) });
    const parsedPdf = await parser.getText();
    const resumeContent: string = parsedPdf.text;

    const { selfDescription, jobDescription } = req.body;

    if (!selfDescription || !jobDescription) {
      res.status(400).json({ message: "selfDescription and jobDescription are required." });
      return;
    }

    // AI — returns matchScore + title + questions + skillGaps + preparationPlan
    const interViewReportByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription,
    });

    // Persist to DB (title & matchScore come from AI, not req.body)
    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...interViewReportByAi, // spreads: title, matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan
    });

    res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (error: any) {
    console.error("Error generating interview report:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
};


/**
 * @description Get a single interview report by its ID (must belong to the logged-in user).
 * @route   GET /api/interview/report/:interviewId
 * @access  Private
 */
export const getInterviewReportByIdController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { interviewId } = req.params;

    // Guard: Mongoose needs a valid 24-char hex ObjectId
    if (!isValidObjectId(interviewId)) {
      res.status(400).json({ message: `"${interviewId}" is not a valid interview ID.` });
      return;
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      res.status(404).json({ message: "Interview report not found." });
      return;
    }

    res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (error: any) {
    console.error("Error fetching interview report:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
};


/**
 * @description Get all interview reports of the logged-in user (lightweight list — no heavy fields).
 * @route   GET /api/interview
 * @access  Private
 */
export const getAllInterviewReportsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
      );

    res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error: any) {
    console.error("Error fetching all interview reports:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
};


/**
 * @description Generate and stream a resume PDF for a given interview report.
 * @route   GET /api/interview/resume/:interviewReportId
 * @access  Private
 */
export const generateResumePdfController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  console.log(`[Controller] Generate Resume Request received for ID: ${req.params.interviewReportId}`);
  try {
    const { interviewReportId } = req.params;

    // Guard: Mongoose needs a valid 24-char hex ObjectId
    if (!isValidObjectId(interviewReportId)) {
      res.status(400).json({ message: `"${interviewReportId}" is not a valid report ID.` });
      return;
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      res.status(404).json({ message: "Interview report not found." });
      return;
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume: resume ?? "",
      jobDescription,
      selfDescription: selfDescription ?? "",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Error generating resume PDF:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
};
