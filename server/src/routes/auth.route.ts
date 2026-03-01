import express from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/get-me", authMiddleware, getMe);

export default router;