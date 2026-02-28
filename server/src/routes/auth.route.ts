import express from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/get-me", getMe);

export default router;