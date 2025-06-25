import request from 'supertest'
import prisma from "../../lib/prisma"
import app from "../../app"

let accessToken: string;

beforeAll(async () => {
    await prisma.user.deleteMany()
    const res = await request(app)
    .post('/api/auth/register')
    .send({email: 'caleb1@example.com', password: '1'})
    accessToken = res.body.token
})

afterAll(async () => {
    await prisma.$disconnect()
})

describe ('POST /api/auth/verify-email', () => {
    it ('should return sucess: Email verified.', async () => {
        const res = await request(app)
        .post(`/api/auth/verify-email`)
        .query({token: accessToken})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
        const user = await prisma.user.findUnique({where: {email: 'caleb1@example.com'}})
        expect(user?.isEmailVerified).toEqual(true)
    })
    it ('should return error: Token not in URL.', async () => {
        const res = await request(app)
        .post(`/api/auth/verify-email`)
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    })
    it ('should return error: Invalid token payload', async () => {
        const res = await request(app)
        .post(`/api/auth/verify-email`)
        .query({token: "blahblahblah"})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    }, 15000)
})