import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createInterviewReport } from "../controllers/interview.controller";

const interviewRouter = Router();

/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description , resume pdf and job description
 * @access private
 */
interviewRouter.post("/", authMiddleware, createInterviewReport);

export default interviewRouter;
