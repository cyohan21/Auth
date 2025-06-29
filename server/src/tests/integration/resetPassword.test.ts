import request from "supertest"
import app from "../../app"
import prisma from "../../lib/prisma"
import {v4 as uuidv4} from "uuid";
import { resetRateLimiters } from "../../middleware/rateLimiter";
import {hashPassword, comparePassword} from "../../utils/bcrypt"

beforeEach(async () => {
    await prisma.passwordHistory.deleteMany() // Foreign key exists on this table, so it must be deleted first.
    await prisma.user.deleteMany()
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
      .post(`/api/auth/reset-password`).send({newPassword: "Dream@505", verifyNewPassword: "Dream@505"})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', 'Token not in URL.')
  })
    it('should return error: Invalid token payload', async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password`)
      .query({ token: "blahblahblah" })
      .send({newPassword: "Dream@505", verifyNewPassword: "Dream@505"})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', 'Token is invalid.')
  })
    it("Should return success.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        const hashedPassword = await hashPassword(password)
        await prisma.user.create({data: {email, hashedPassword, isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/forgot-password').send({email})
        const token = res.body.token
        const forgotPasswordRes = await request(app).post(`/api/auth/reset-password?token=${token}`).send({newPassword: "Dream@102", verifyNewPassword: "Dream@102"})
        expect(forgotPasswordRes.status).toBe(200)
        expect(forgotPasswordRes.body).toHaveProperty('message', 'Password successfully reset.')
    })
    it("Should return error: Old password.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        const hashedPassword = await hashPassword(password)
        await prisma.user.create({data: {email, hashedPassword, isEmailVerified: true}})
        const hashedOldPassword = await hashPassword("Dream@102")
        await prisma.passwordHistory.create({data: {userEmail: email, oldPasswordHash: hashedOldPassword}})
        const res = await request(app)
        .post('/api/auth/forgot-password').send({email})
        const token = res.body.token
        const forgotPasswordRes = await request(app).post(`/api/auth/reset-password?token=${token}`).send({newPassword: "Dream@102", verifyNewPassword: "Dream@102"})
        expect(forgotPasswordRes.status).toBe(409)
        expect(forgotPasswordRes.body).toHaveProperty('error', 'Cannot reuse previous passwords.')
    })
    it("Should return error: Same password.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        const hashedPassword = await hashPassword(password)
        await prisma.user.create({data: {email, hashedPassword, isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/forgot-password').send({email})
        const token = res.body.token
        const forgotPasswordRes = await request(app).post(`/api/auth/reset-password?token=${token}`).send({newPassword: "Dream@505", verifyNewPassword: "Dream@505"})
        expect(forgotPasswordRes.status).toBe(409)
        expect(forgotPasswordRes.body).toHaveProperty('error', 'New password cannot be the same as your current password.')
    })
    it("Should return error: Passwords must match.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        const hashedPassword = await hashPassword(password)
        await prisma.user.create({data: {email, hashedPassword, isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/forgot-password').send({email})
        const token = res.body.token
        const forgotPasswordRes = await request(app).post(`/api/auth/reset-password?token=${token}`).send({newPassword: "Dream@505", verifyNewPassword: "Dream@502"})
        expect(forgotPasswordRes.status).toBe(400)
        expect(forgotPasswordRes.body).toHaveProperty('error', 'Passwords must match.')
    })
    it("Should return error: Weak password.", async () => {
        const email = `user+${uuidv4()}@example.com`
        const password = "Dream@505"
        const hashedPassword = await hashPassword(password)
        await prisma.user.create({data: {email, hashedPassword, isEmailVerified: true}})
        const res = await request(app)
        .post('/api/auth/forgot-password').send({email})
        const token = res.body.token
        const forgotPasswordRes = await request(app).post(`/api/auth/reset-password?token=${token}`).send({newPassword: "Dream", verifyNewPassword: "Dream"})
        expect(forgotPasswordRes.status).toBe(400)
        expect(forgotPasswordRes.body).toHaveProperty('error')
        expect(forgotPasswordRes.body.details.newPassword).toContain('Password must be at least 8 characters long.')
    })


})