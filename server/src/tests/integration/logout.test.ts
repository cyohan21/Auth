import request from "supertest"
import app from "../../app"
import prisma from "../../lib/prisma"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const secret = process.env.JWT_SECRET

let email: string;
let password: string;
let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
    await prisma.user.deleteMany();
    email = "caleb3@example.com"
    password = "3"

    const res = await request(app)
    .post('/api/auth/register')
    .send({email, password})
    await prisma.user.update({where: {email: email}, data: {isEmailVerified: true}})

    const loginRes = await request(app)
    .post('/api/auth/login')
    .send({email, password})
    accessToken = loginRes.body.accessToken

    const cookies = loginRes.headers['set-cookie'];
    const cookiesArray = Array.isArray(cookies) ? cookies : (typeof cookies === 'string' ? [cookies] : []);
    const refreshCookie = cookiesArray.find(c => c.startsWith('refreshToken='));
    refreshToken = refreshCookie?.split(';')[0].split('=')[1] ?? '';
});


afterAll(async () => {
    await prisma.$disconnect();
})

describe('POST /api/auth/logout', () => {
    it("Should return error: No token provided.", async () => {
        const res = await request(app)
        .post('/api/auth/logout')
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
        const decoded = jwt.verify(accessToken, secret!) as jwt.JwtPayload;
        await prisma.tokenBlacklist.create({ data: { jti: decoded.jti as string } });
        const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set("Cookie", [`refreshToken=`])
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Successfully logged out.")
    })
    it("Should return success, with no refresh token.", async () => {
        const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set("Cookie", [`refreshToken=`])
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Successfully logged out.")
    })
    it("Should return success.", async () => {
        const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message', "Successfully logged out.")
    })
})