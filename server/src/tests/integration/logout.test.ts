import request from "supertest"
import app from "../../app"
import prisma from "../../lib/prisma"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid"
dotenv.config()

const secret = process.env.JWT_SECRET!

beforeEach(async () => {
  await prisma.user.deleteMany()
  await prisma.tokenBlacklist.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/auth/logout', () => {
  it("Should return error: No token provided.", async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', "No tokens provided.")
  })

  it("Should return error: Invalid session.", async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer blahblah`)
      .set("Cookie", ["refreshToken=blahblahblah"])
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("error", "Invalid session. Please try to log in again.")
  })

  it("Should return success, with blacklisted access token, and no refresh.", async () => {
    const email = `user+${uuidv4()}@example.com`
    const password = "3"

    await request(app).post('/api/auth/register').send({ email, password })
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } })

    const loginRes = await request(app).post('/api/auth/login').send({ email, password })
    const accessToken = loginRes.body.accessToken

    const decoded = jwt.verify(accessToken, secret) as jwt.JwtPayload
    await prisma.tokenBlacklist.create({ data: { jti: decoded.jti! } })

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set("Cookie", [`refreshToken=`])

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', "Successfully logged out.")
  })

  it("Should return success, with no refresh token.", async () => {
    const email = `user+${uuidv4()}@example.com`
    const password = "3"

    await request(app).post('/api/auth/register').send({ email, password })
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } })

    const loginRes = await request(app).post('/api/auth/login').send({ email, password })
    const accessToken = loginRes.body.accessToken

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set("Cookie", [`refreshToken=`])

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', "Successfully logged out.")
  })

  it("Should return success.", async () => {
    const email = `user+${uuidv4()}@example.com`
    const password = "3"

    await request(app).post('/api/auth/register').send({ email, password })
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } })

    const loginRes = await request(app).post('/api/auth/login').send({ email, password })

    const accessToken = loginRes.body.accessToken
    const cookiesRaw = loginRes.headers['set-cookie'] || []
    const cookies: string[] = Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw]
    const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='))
    const refreshToken = refreshCookie?.split(';')[0].split('=')[1] ?? ''

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set("Cookie", [`refreshToken=${refreshToken}`])

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', "Successfully logged out.")
  })
})
