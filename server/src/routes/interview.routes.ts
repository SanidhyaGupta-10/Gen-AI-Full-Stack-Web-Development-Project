import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/file.middleware";
import {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
} from "../controllers/interview.controller";


const interviewRouter = Router();

/**
 * @route   POST /api/interview
 * @desc    Generate a new interview report from resume PDF, self description & job description
 * @access  Private
 */
interviewRouter.post(
    "/",
    authMiddleware,
    upload.single("resume"),
    generateInterViewReportController as any
);

/**
 * @route   GET /api/interview
 * @desc    Get all interview reports of the logged-in user (list view, no heavy fields)
 * @access  Private
 */
interviewRouter.get("/", authMiddleware, getAllInterviewReportsController as any);

/**
 * @route   GET /api/interview/report/:interviewId
 * @desc    Get a single interview report by ID (must belong to logged-in user)
 * @access  Private
 */
interviewRouter.get(
    "/report/:interviewId",
    authMiddleware,
    getInterviewReportByIdController as any
);

/**
 * @route   GET /api/interview/resume/:interviewReportId
 * @desc    Generate and download a resume PDF for a given interview report
 * @access  Private
 */
interviewRouter.get(
    "/resume/:interviewReportId",
    authMiddleware,
    generateResumePdfController as any
);


export default interviewRouter;
