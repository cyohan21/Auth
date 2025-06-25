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
        return void res.status(400).json({error: "Both email and password are required."});  
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            return void res.status(409).json({error: "User already exists."})
        }
        const hashedPassword = await hashPassword(password) // all variables that use async functions must call await.
        await prisma.user.create({data: {email, hashedPassword}})
        console.log("User added.")
        const token = jwt.sign({email}, secret!, { expiresIn: "1d" })
        console.log(`Email confirmation link: http://localhost:${port}/api/auth/verify-email?token=${token}`)
        return void res.status(200).json({message: "User added. Please check your email for the confirmation link."})
             
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error: "Something went wrong with the server."});
    }

}

export const verifyEmail: RequestHandler = async (req, res, next) => {
    const token = req.query.token as string; // Get token from URL

    if (!token) {
        return void res.status(400).json({error: "Token not in URL."})
    }

    try {
        const decoded = jwt.verify(token, secret!) as {email: string}
        if (!decoded.email) {
            return void res.status(400).json({error: "Invalid token payload."})
        }
        const userEmail = decoded.email

        await prisma.user.update({ where: { email: userEmail }, data: { isEmailVerified: true } });
        return void res.status(200).json({message: "Email Verified."})

    }
    catch (err) {
        console.error("Invalid or expired token.");
    }
}

export const reVerifyEmail: RequestHandler = async (req, res, next) => {
    const {email} = req.body;

    if (!email) return void res.status(400).json({error: "No email provided."})
    try {
    const user = await prisma.user.findUnique({where: {email}})

    if (!user) return void res.status(400).json({error: "No account found with the provided email."})
    if (user.isEmailVerified) return void res.status(400).json({error: "Email has already been verified"})
    
    const token = jwt.sign({email}, secret!, { expiresIn: "1d" })
    console.log(`Email confirmation link: http://localhost:${port}/api/auth/verify-email?token=${token}`)
    return void res.status(200).json({message: "Email confirmation link resent. Please check your email for the confirmation link."})
}
    catch (err) {
        console.error(err)
        return void res.status(500).json({error: "Something went wrong with the server."})
    }
}

export const login: RequestHandler = async (req, res, next) => {
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({ where: {email}});
    if (!user) {
        return void res.status(400).json({error: "User not found."})
    }
    if (!password) {
        return void res.status(400).json({error: "No password entered."})
    }
    if (!user.isEmailVerified) {
        return void res.status(400).json({error: "User is not yet verified. Please check your email."})
    }
    const verifiedPassword = comparePassword(password, user.hashedPassword)
    if (!verifiedPassword) {
        return void res.status(400).json({error: "Password is incorrect."})
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
    return void res.status(200).json({message: "Successfully logged in."})
    }
    catch (err) {
        console.error(err)
        return void res.status(500).json({error: "Something went wrong with the server."})
    }
}

export const logout: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization as string
    const token = authHeader?.split(" ")[1]; // Split from Bearer, and take the token only
    if (!token) {
        return void res.status(400).json({error: "No token provided."})
    }
    try {
    const decoded = jwt.verify(token, secret!) as jwt.JwtPayload
    if (!decoded || !decoded.jti) {
        return void res.status(400).json({error: "Token is invalid or expired."})
    }
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({where: {jti: decoded.jti}})
    if (blacklistedToken) {
        return void res.status(400).json({error: "Token already blacklisted."})
    }
    await prisma.tokenBlacklist.create({data: {jti: decoded.jti as string}})
    return void res.status(200).json({message: "Successfully logged out."})
    }
    catch (err) {
        console.error(err)
        return void res.status(500).json({error: "Something went wrong with the server."})
    }
}

export const refresh: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization as string
    const token = authHeader?.split(" ")[1];
    if (!token) return void res.status(400).json({error: "No token provided."})

    try {
        const oldRefreshToken = req.cookies.refreshToken
        if (!oldRefreshToken) return void res.status(400).json({error: "You are not currently logged in, or your session has expired."})
        
    const decoded = jwt.verify(oldRefreshToken, secret!) as jwt.JwtPayload
    if (!decoded || !decoded.jti) {
        return void res.status(400).json({error: "Token is invalid or expired."})
    }
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({where: {jti: decoded.jti}})
    if (blacklistedToken) {
        return void res.status(400).json({error: "Token already blacklisted."})
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
    catch (err) {
        console.error(err)
        return void res.status(500).json({error: "Something went wrong with the server."})
    }

    

}