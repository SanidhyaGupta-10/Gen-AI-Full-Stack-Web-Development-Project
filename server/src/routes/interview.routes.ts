import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/file.middleware";
import { interviewController } from "../controllers/interview.controller";


const interviewRouter = Router();

/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description , resume pdf and job description
 * @access private
 */
interviewRouter.post("/", authMiddleware, upload.single('resume'), interviewController as any);

export default interviewRouter;
