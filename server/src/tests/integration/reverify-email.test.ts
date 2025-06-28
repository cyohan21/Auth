import request from 'supertest'
import prisma from "../../lib/prisma"
import app from "../../app"
import {v4 as uuidv4} from "uuid";

beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.tokenBlacklist.deleteMany()
})

afterAll(async () => {
    await prisma.$disconnect()
})

describe ('POST /api/auth/resend-email-confirmation', () => {
    it ('should return error: No email provided.', async () => {
        const res = await request(app).post(`/api/auth/resend-email-confirmation`).send({email: ""})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "No email provided.")
    })
    it ('should return error: No account found with the provided email.', async () => {
        const email = `user+${uuidv4()}@example.com`;
        await request(app).post('/api/auth/register').send({email: email, password: "Dream@505"})
        const res = await request(app)
        .post(`/api/auth/resend-email-confirmation`)
        .send({email: "blahblah@gmail.com"})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "No account found with the provided email.")
    })
    it ('should return success', async () => {
        const email = `user+${uuidv4()}@example.com`;
        await request(app).post('/api/auth/register').send({email: email, password: "Dream@505"})
        const res = await request(app)
        .post(`/api/auth/resend-email-confirmation`)
        .send({email: email})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Email confirmation link resent. Please check your email for the confirmation link.")
    })
    it ('should return error: Email already verified', async () => {
        const email = `user+${uuidv4()}@example.com`;
        await request(app).post('/api/auth/register').send({email: email, password: "Dream@505"})
        await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post(`/api/auth/resend-email-confirmation`)
        .send({email: email})
        expect(res.status).toBe(409)
        expect(res.body).toHaveProperty('error', "Email has already been verified.")
    })
})