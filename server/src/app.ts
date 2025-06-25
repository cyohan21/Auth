import express from "express";
import cors from "cors";
import authRouter from "./routes/authRouter";
import cookieParser from "cookie-parser";

const app = express();
const frontendPort = 3000;

app.use(cors({
    origin: `http://localhost:${frontendPort}`,
    credentials: true // Allows cookies/auth headers to be passed on between ports.
}));

app.use(express.json());
app.use(cookieParser()); // Needed to get refresh tokens from req.cookies.refreshToken
app.use("/api/auth", authRouter);

export default app;