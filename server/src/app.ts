import express from "express";
import type { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello World!"
    })
});


export default app;