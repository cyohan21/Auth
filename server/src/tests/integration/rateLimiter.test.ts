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
describe('POST /api/auth/login', () => {
    it("Should return 429: Too many login attempts.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"

        let lastResponse: any;

        for (let i = 0; i < 6; i++) {
        lastResponse = await request(app).post('/api/auth/login').send({email: email, password: password})
        }

        expect(lastResponse.status).toBe(429)
        expect(lastResponse.body).toHaveProperty('error', 'Too many login attempts. Please try again later.')
    })
    it("Should return 429: Too many registration attempts.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"

        let lastResponse: any;

        for (let i = 0; i < 6; i++) {
        lastResponse = await request(app).post('/api/auth/register').send({email: email, password: password})
        }

        expect(lastResponse.status).toBe(429)
        expect(lastResponse.body).toHaveProperty('error', 'Too many registration attempts. Please try again later.')
    })
    it("Should return 429: Too many refresh attempts.", async () => {
    let res: any;

    for (let i = 0; i < 11; i++) {
    res = await request(app).post('/api/auth/refresh').set("Cookie", [`refreshToken=blahblahblah`])
    }

    expect(res.status).toBe(429)
    expect(res.body).toHaveProperty('error', 'Too many refresh attempts. Please try again later.')
  })
  it ('should return 429: Too many attempts (resend-email-confirmation).', async () => {
        let res: any;
        
        for (let i = 0; i < 6; i++) {
        res = await request(app).post(`/api/auth/resend-email-confirmation`).send({email: "blahblah@gmail.com"})
        }

        expect(res.status).toBe(429)
        expect(res.body).toHaveProperty('error', "Too many attempts. Please try again later.")
    })
      it ('should return 429: Too many attempts (verify-email).', async () => {
        let res: any;
        
        for (let i = 0; i < 6; i++) {
        res = await request(app).post(`/api/auth/verify-email`).query({ token: "blahblahblah" })
        }

        expect(res.status).toBe(429)
        expect(res.body).toHaveProperty('error', "Too many attempts. Please try again later.")
    })
})