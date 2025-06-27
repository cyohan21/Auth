import request from 'supertest'
import prisma from "../../lib/prisma"
import app from "../../app"

beforeAll(async () => {
    await prisma.user.deleteMany()
    const res = await request(app)
    .post('/api/auth/register')
    .send({email: 'caleb1@example.com', password: '1'})
})

afterAll(async () => {
    await prisma.$disconnect()
})

describe ('POST /api/auth/resend-email-confirmation', () => {
    it ('should return error: No email provided.', async () => {
        const res = await request(app)
        .post(`/api/auth/resend-email-confirmation`)
        .send({email: ""})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "No email provided.")
    })
    it ('should return error: No account found with the provided email.', async () => {
        const res = await request(app)
        .post(`/api/auth/resend-email-confirmation`)
        .send({email: "caleb505@gmail.com"})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error', "No account found with the provided email.")
    })
    it ('should return success', async () => {
        const res = await request(app)
        .post(`/api/auth/resend-email-confirmation`)
        .send({email: "caleb1@example.com"})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Email confirmation link resent. Please check your email for the confirmation link.")
    })
    it ('should return error: Email already verified', async () => {
        await prisma.user.update({where: {email: "caleb1@example.com"}, data: {isEmailVerified: true}})
        const res = await request(app)
        .post(`/api/auth/resend-email-confirmation`)
        .send({email: "caleb1@example.com"})
        expect(res.status).toBe(409)
        expect(res.body).toHaveProperty('error', "Email has already been verified.")
    })

})