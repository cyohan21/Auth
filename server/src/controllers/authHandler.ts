import {RequestHandler} from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
dotenv.config()
// Lib
import prisma from "../lib/prisma"
// Utils
import {hashPassword, comparePassword} from "../utils/bcrypt"
// Middleware

const secret = process.env.JWT_SECRET
const port = process.env.PORT

export const register: RequestHandler = async (req, res, next) => {
    const {email, password} = req.body;

    if (!email || !password) {
        const error = new Error("Both email and password are required.");
        (error as any).status = 400
        return next(error)  
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const error = new Error("User already exists.");
            (error as any).status = 409
            return next(error)
        }
        const hashedPassword = await hashPassword(password) // all variables that use async functions must call await.
        await prisma.user.create({data: {email, hashedPassword}})
        console.log("User added.")
        const token = jwt.sign({email}, secret!, { expiresIn: "1d" })
        console.log(`Email confirmation link: http://localhost:${port}/api/auth/verify-email?token=${token}`)
        return void res.status(200).json({message: "User added. Please check your email for the confirmation link.", token})
             
    }
    catch (err) {
        const error = new Error("Something went wrong with the server.");
        (error as any).status = 500;
        return next(error);
    }

}

export const verifyEmail: RequestHandler = async (req, res, next) => {
    const token = req.query.token as string; // Get token from URL

    if (!token) {
        const error = new Error("Token not in URL.");
        (error as any).status = 400
        return next(error)
    }

    try {
        const decoded = jwt.verify(token, secret!) as {email: string}
        if (!decoded || !decoded.email) {
        const error = new Error("Invalid token payload.");
        (error as any).status = 400
        return next(error)
        }
        const userEmail = decoded.email

        await prisma.user.update({ where: { email: userEmail }, data: { isEmailVerified: true } });
        return void res.status(200).json({message: "Email Verified."})

    }
    catch (err: any) {
        if (err.name === 'TokenExpiredError') {
        const error = new Error("Token has expired.");
        (error as any).status = 400
        return next(error)
        }
        if (err.name === 'JsonWebTokenError') {
        const error = new Error("Token is invalid.");
        (error as any).status = 400
        return next(error)
        }
        const error = new Error("Something went wrong with the server.");
        (error as any).status = 500;
        return next(error);
    }
}

export const reVerifyEmail: RequestHandler = async (req, res, next) => {
    const {email} = req.body;

    if (!email) {
        const error = new Error("No email provided.");
        (error as any).status = 400
        return next(error)
    }
    try {
    const user = await prisma.user.findUnique({where: {email}})

    if (!user) {
        const error = new Error("No account found with the provided email.");
        (error as any).status = 400
        return next(error)
    }
    if (user.isEmailVerified) {
        const error = new Error("Email has already been verified.");
        (error as any).status = 409
        return next(error)
    }
    
    const token = jwt.sign({email}, secret!, { expiresIn: "1d" })
    console.log(`Email confirmation link: http://localhost:${port}/api/auth/verify-email?token=${token}`)
    return void res.status(200).json({message: "Email confirmation link resent. Please check your email for the confirmation link."})
}
    catch (err) {
        const error = new Error("Something went wrong with the server.");
        (error as any).status = 500;
        return next(error);
    }
}

export const login: RequestHandler = async (req, res, next) => {
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({ where: {email}});
    if (!user) {
        const error = new Error("User not found.");
        (error as any).status = 400;
        return next(error);
    }
    if (!password) {
        const error = new Error("No password entered.");
        (error as any).status = 400;
        return next(error);
    }
    if (!user.isEmailVerified) {
        const error = new Error("User is not yet verified. Please check your email.");
        (error as any).status = 400;
        return next(error);
    }
    const verifiedPassword = await comparePassword(password, user.hashedPassword)
    if (!verifiedPassword) {
        const error = new Error("Password is incorrect.");
        (error as any).status = 401;
        return next(error);
    }
    try {
    const accessToken = jwt.sign({id: user.id, email: user.email}, secret!, {expiresIn: "15m", jwtid: uuidv4()})
    console.log("Access Token:", accessToken)
    const refreshToken = jwt.sign({id: user.id, email: user.email}, secret!, {expiresIn: "7d", jwtid: uuidv4()})
    console.log("Refresh Token:", refreshToken)

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Prevents XSS attacks
        secure: true, // Only sent over HTTPS
        sameSite: "strict", 
        maxAge: 1000 * 60 * 60 * 24 * 7
    })
    return void res.status(200).json({message: "Successfully logged in.", accessToken, refreshToken})
    }
    catch (err) {
        const error = new Error("Something went wrong with the server.");
        (error as any).status = 500;
        return next(error);
    }
}

export const logout: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization as string
    const token = authHeader?.split(" ")[1]; // Split from Bearer, and take the token only
    const refreshToken = req.cookies.refreshToken;
    if (!token && !refreshToken) {
        return void res.status(400).json({error: "No tokens provided."})
    }
    let accessHandled = false;
    let refreshHandled = false;

    if (token) {
    try {
        const decodedToken = jwt.verify(token, secret!) as jwt.JwtPayload
        const blacklistedToken = await prisma.tokenBlacklist.findUnique({where: {jti: decodedToken.jti}})
        if (!blacklistedToken) {
            await prisma.tokenBlacklist.create({data: {jti: decodedToken.jti as string}})
            accessHandled = true
        }
        else {
        console.warn("Access token already blacklisted.");
        accessHandled = true
        }
    }
    catch (err: any) {
            console.warn("Access token issue:", err.name);
        }
    }

    if (refreshToken) {
        try {
            const decodedRefresh = jwt.verify(refreshToken, secret!) as jwt.JwtPayload
            const blacklistedRefresh = await prisma.tokenBlacklist.findUnique({where: {jti: decodedRefresh.jti}})
            if (!blacklistedRefresh) {
                await prisma.tokenBlacklist.create({data: {jti: decodedRefresh.jti as string}})
                refreshHandled = true
            }
            else {
            console.warn("Refresh token already blacklisted.");
            refreshHandled = true
            }
        }
        catch (err: any) {
                console.warn("Refresh token issue:", err.name);
            }
    }

    if (!accessHandled && !refreshHandled) {
        const error = new Error("Invalid session. Please try to log in again.");
        (error as any).status = 400;
        return next(error);
    }
    return void res.status(200).json({message: "Successfully logged out."})
    }

export const refresh: RequestHandler = async (req, res, next) => {
    const oldRefreshToken = req.cookies.refreshToken
        if (!oldRefreshToken) {
            const error = new Error("No token provided.");
        (error as any).status = 400;
        return next(error);
        }

    try {   
    const decoded = jwt.verify(oldRefreshToken, secret!) as jwt.JwtPayload
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({where: {jti: decoded.jti}})
    if (blacklistedToken) {
        console.warn("Refresh token already blacklisted.")
    }
    const accessToken = jwt.sign({id: decoded.id, email: decoded.email}, secret!, {expiresIn: "15m", jwtid: uuidv4()})
    console.log("Access Token:", accessToken)
    const newRefreshToken = jwt.sign({id: decoded.id, email: decoded.email}, secret!, {expiresIn: "7d", jwtid: uuidv4()})
    console.log("Refresh Token:", newRefreshToken)

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true, // Prevents XSS attacks
        secure: true, // Only sent over HTTPS
        sameSite: "strict", 
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 Days
    })

    return void res.status(200).json({message: "Tokens refreshed."})
}
    catch (err: any) {
        if (err.name === 'TokenExpiredError') {
        const error = new Error("Token has expired.");
        (error as any).status = 400
        return next(error)
        }
        if (err.name === 'JsonWebTokenError') {
        const error = new Error("Token is invalid.");
        (error as any).status = 400
        return next(error)
        }
        const error = new Error("Something went wrong with the server.");
        (error as any).status = 500;
        return next(error);
    }

    

}