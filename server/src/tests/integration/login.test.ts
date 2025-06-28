import request from "supertest"
import app from "../../app"
import prisma from "../../lib/prisma"
import {v4 as uuidv4} from "uuid";

beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.tokenBlacklist.deleteMany()
})

afterAll(async () => {
    await prisma.$disconnect();
})

describe('POST /api/auth/login', () => {
    it("Should return error: User email is not yet verified", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        await request(app).post('/api/auth/register').send({email: email, password: password})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: email, password: password})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "User is not yet verified. Please check your email.")
    })
    it("Should return error: No password entered", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        await request(app).post('/api/auth/register').send({email: email, password: password})
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: email, password: ''})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "Validation failed.")
        // Zod
        expect(res.body.details.password).toContain("Please enter a password.");
    })
    it("Should return error: User not found", async () => {
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: `user+${uuidv4()}@example.com`, password: 'aass'})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "User not found.")
    })
    it("Should return error: password is incorrect.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        await request(app).post('/api/auth/register').send({email: email, password: password})
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: email, password: 'aass'})
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('error', "Password is incorrect.")
    })
    it("Should return sucess: User logged in.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        await request(app).post('/api/auth/register').send({email: email, password: password})
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: email, password: password})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Successfully logged in.")
    })
})