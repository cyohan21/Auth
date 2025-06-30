import request from 'supertest'
import prisma from "../../lib/prisma"
import app from "../../app"
import { v4 as uuidv4 } from "uuid"

beforeEach(async () => {
  await prisma.user.deleteMany()
  await prisma.tokenBlacklist.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/auth/verify-email', () => {
  it('should return success: Email verified.', async () => {
    const email = `user+${uuidv4()}@example.com`
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'Dream@505' })
    const accessToken = regRes.body.token

    const res = await request(app)
      .get(`/api/auth/verify-email`)
      .query({ token: accessToken })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')

    const user = await prisma.user.findUnique({ where: { email } })
    expect(user?.isEmailVerified).toEqual(true)
  })

  it('should return error: Token not in URL.', async () => {
    const res = await request(app)
      .get(`/api/auth/verify-email`)

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', "Token not in URL.")
  })

  it('should return error: Invalid token payload', async () => {
    const res = await request(app)
      .get(`/api/auth/verify-email`)
      .query({ token: "blahblahblah" })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
