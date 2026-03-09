import express from "express";
import type { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import interviewRouter from "./routes/interview.routes";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello World!"
    })
});

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRouter)


export default app;