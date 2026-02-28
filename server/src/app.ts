import express from "express";
import type { Request, Response } from "express";
import authRoutes from "./routes/auth.route";
import cookieParser from "cookie-parser";

const app = express();

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