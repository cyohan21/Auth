import request from "supertest"
import app from "../../app"
import prisma from "../../lib/prisma"

let email: string;
let password: string;

beforeAll(async () => {
    await prisma.user.deleteMany();
    email = "caleb3@example.com"
    password = "3"
    const res = await request(app)
    .post('/api/auth/register')
    .send({email: email, password: password})
})

afterAll(async () => {
    await prisma.$disconnect();
})

describe('POST /api/auth/login', () => {
    it("Should return error: User email is not yet verified", async () => {
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: 'caleb3@example.com', password: '3'})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "User is not yet verified. Please check your email.")
    })
    it("Should return error: No password entered", async () => {
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: 'caleb3@example.com', password: ''})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "No password entered.")
    })
    it("Should return error: User not found", async () => {
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: 'caleb10@example.com', password: 'aass'})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "User not found.")
    })
    it("Should return error: password is incorrect.", async () => {
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: 'caleb3@example.com', password: 'aass'})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "Password is incorrect.")
    })
    it("Should return sucess: User logged in.", async () => {
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/login')
        .send({email: 'caleb3@example.com', password: '3'})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Successfully logged in.")
    })
})