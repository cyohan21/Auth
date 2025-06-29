import {RequestHandler} from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config()
// Lib
import prisma from "../lib/prisma"
// Utils
import {hashPassword, comparePassword} from "../utils/bcrypt"
// Middleware

const secret = process.env.JWT_SECRET
const port = process.env.PORT

export const forgotPassword: RequestHandler = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        const error = new Error("No email provided.");
        (error as any).status = 400;
        return next(error);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const error = new Error("No user found with the associated email.");
        (error as any).status = 400;
        return next(error);
    }

    const token = jwt.sign({ email }, secret!, { expiresIn: "1d" });
    console.log(`Email confirmation link: http://localhost:${port}/api/auth/reset-password?token=${token}`);

    return void res.status(200).json({
        message: "Password reset link sent. Please check your email.",
        token
    });
}

export const resetPassword: RequestHandler = async (req, res, next) => {
    const token = req.query.token as string;

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

        try {
        const {newPassword, verifyNewPassword} = req.body
        if (!newPassword) {
            const error = new Error("A new password must be entered.");
            (error as any).status = 400;
            return next(error);
        }

        if (!verifyNewPassword) {
            const error = new Error("Please re-enter your new password.");
            (error as any).status = 400;
            return next(error);
        }

        if (newPassword !== verifyNewPassword) {
            const error = new Error("Passwords must match.");
            (error as any).status = 400;
            return next(error);
        }

        const newHashedPassword = await hashPassword(newPassword)
        const oldHashes = await prisma.passwordHistory.findMany({
            where: {userEmail}, 
            select: {oldPasswordHash: true}})
        
        for (const {oldPasswordHash} of oldHashes) {
            if (await comparePassword(newPassword, oldPasswordHash)) {
                const error = new Error("Cannot reuse previous passwords.");
                (error as any).status = 409;
                return next(error);
            }
        }
        const user = await prisma.user.findUnique({where: {email: userEmail}, select: {hashedPassword: true}})
        if (!user || !user.hashedPassword) {
            const error = new Error("User not found or missing password hash.");
            (error as any).status = 500;
            return next(error);
        }
        if (await comparePassword(newPassword, user.hashedPassword)) {
            const error = new Error("New password cannot be the same as your current password.");
            (error as any).status = 409;
            return next(error);
        }
        await prisma.passwordHistory.create({data: {userEmail, oldPasswordHash: user.hashedPassword}})
        await prisma.user.update({where: {email: userEmail}, data: {hashedPassword: newHashedPassword}})
        return void res.status(200).json({message: "Password successfully reset."})
        }
        catch (err: any) {
            const error = new Error("Something went wrong with the server.");
            (error as any).status = 500;
            return next(error);
        }
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