import request from "supertest"
import app from "../../app"
import prisma from "../../lib/prisma"
import {v4 as uuidv4} from "uuid";
import { resetRateLimiters } from "../../middleware/rateLimiter";

beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.passwordHistory.deleteMany()
    await prisma.tokenBlacklist.deleteMany()
})

afterAll(async () => {
    await prisma.$disconnect();
})

afterEach(async () => {
    resetRateLimiters();
})

describe('POST /api/auth/reset-password', () => {
    it('should return error: Token not in URL.', async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password`).send({newPassword: "password", verifyNewPassword: "password"})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', 'Token not in URL.')
  })
    it('should return error: Invalid token payload', async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password`)
      .query({ token: "blahblahblah" })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', 'Token is invalid.')
  })
    it("Should return success.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        await prisma.user.create({data: {email, hashedPassword: password, isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/forgot-password').send({email})
        const token = res.body.token
        const forgotPasswordRes = await request(app).post(`/api/auth/reset-password?token=${token}`).send({newPassword: "Dream@102", verifyNewPassword: "Dream@102"})
        expect(forgotPasswordRes.status).toBe(200)
        expect(forgotPasswordRes.body).toHaveProperty('message', 'Password successfully reset.')
    }, 100000)

})