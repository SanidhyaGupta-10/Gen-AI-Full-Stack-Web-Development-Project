import express from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access public
 */
router.post("/register", registerUser);

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access public
 */
router.post("/login", loginUser);

/**
 * @route POST /api/auth/logout
 * @description Logout current user and blacklist the token
 * @access private
 */

router.post("/logout", authMiddleware, logoutUser);

/**
 * @route GET /api/auth/get-me
 * @description Get current user details
 * @access private
 */
router.get("/get-me", authMiddleware, getMe);

export default router;
