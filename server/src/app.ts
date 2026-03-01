import express from "express";
import type { Request, Response } from "express";
import authRoutes from "./routes/auth.route";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
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


export default app;