import express from "express";
import cors from "cors";
import authRouter from "./routes/authRouter"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config()

const app=express();
const PORT = process.env.PORT;
const frontendPort = 3000;

app.use(cors({
    origin: `http://localhost:${frontendPort}`,
    credentials: true // Allows cookies/auth headers to be passed on between ports.
}));

app.use(express.json())
app.use("/api/auth", authRouter)
app.use(cookieParser()); // Needed to get refresh tokens from req.cookies.refreshToken

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}.`)
})