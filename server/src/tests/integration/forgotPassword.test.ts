import request from "supertest"
import app from "../../app"
import prisma from "../../lib/prisma"
import {v4 as uuidv4} from "uuid";
import { resetRateLimiters } from "../../middleware/rateLimiter";

beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.tokenBlacklist.deleteMany()
})

afterAll(async () => {
    await prisma.$disconnect();
})

afterEach(async () => {
    resetRateLimiters();
})

describe('POST /api/auth/forgot-password', () => {
    it("Should return success: User logged in.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        await request(app).post('/api/auth/register').send({email: email, password: password})
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/forgot-password').send({email})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Password reset link sent. Please check your email.")
    })
    it("Should return error: Invalid email.", async () => {
        const res = await request(app).post(`/api/auth/forgot-password`).send({ email: "blahblahblah" })
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
        expect(res.body.details.email).toContain("Invalid email address.");
    })
    it("Should return error: No email.", async () => {
        const res = await request(app).post(`/api/auth/forgot-password`).send({ email: "" })
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
        expect(res.body.details.email).toContain("Invalid email address.");

    })
    it("Should return error: No user found.", async () => {
        const res = await request(app).post(`/api/auth/forgot-password`).send({ email: `user+${uuidv4()}@example.com` })
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "No user found with the associated email.")
    })
})
