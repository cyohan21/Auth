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

describe('POST /api/auth/refresh', () => {
  it("Should return error: No token provided.", async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set("Cookie", [`refreshToken=`])

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', "No token provided.")
  })

  it("Should return error: Invalid token.", async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set("Cookie", [`refreshToken=blahblahblah`])

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Token has expired|Token is invalid./)
  })

  it("Should return success.", async () => {
    const email = `user+${uuidv4()}@example.com`
    const password = "Dream@505"

    await request(app).post('/api/auth/register').send({ email, password })
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } })

    const loginRes = await request(app).post('/api/auth/login').send({ email, password })
    const cookiesRaw = loginRes.headers['set-cookie'] || []
    const cookies: string[] = Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw]
    const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='))
    const refreshToken = refreshCookie?.split(';')[0].split('=')[1] ?? ''

    const res = await request(app)
      .post('/api/auth/refresh')
      .set("Cookie", [`refreshToken=${refreshToken}`])

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', "Tokens refreshed.")
  })

  it("Should return ok: Token already blacklisted.", async () => {
    const email = `user+${uuidv4()}@example.com`
    const password = "Dream@505"

    await request(app).post('/api/auth/register').send({ email, password })
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } })

    const loginRes = await request(app).post('/api/auth/login').send({ email, password })
    const cookiesRaw = loginRes.headers['set-cookie'] || []
    const cookies: string[] = Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw]
    const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='))
    const refreshToken = refreshCookie?.split(';')[0].split('=')[1] ?? ''

    const decoded = jwt.verify(refreshToken, secret) as jwt.JwtPayload
    await prisma.tokenBlacklist.create({ data: { jti: decoded.jti! } })

    const res = await request(app)
      .post('/api/auth/refresh')
      .set("Cookie", [`refreshToken=${refreshToken}`])

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', "Tokens refreshed.")
  })
})
