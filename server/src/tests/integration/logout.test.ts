import request from "supertest";
import app from "../../app";
import prisma from "../../lib/prisma";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();


function getCookies(res: request.Response) {
  const cookiesRaw = res.headers['set-cookie'] || [];
  const cookies: string[] = Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw];
  return cookies.map(c => c.split(';')[0]).join('; ');
}

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.tokenBlacklist.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/logout', () => {
  it("Should return error: No token provided.", async () => {
    const res = await request(app).get('/api/auth/logout');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', "No tokens provided.");
  });

  it("Should return error: Invalid session.", async () => {

    const res = await request(app)
      .get('/api/auth/logout')
      .set("Cookie", ["accessToken=invalid", "refreshToken=invalid"]);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid session. Please try to log in again.");
  });

  it("Should return success, with blacklisted access token, and no refresh.", async () => {
    const email = `user+${uuidv4()}@example.com`;
    const password = "Dream@505";

    await request(app).post('/api/auth/register').send({ email, password });
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } });

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    const cookieHeader = getCookies(loginRes);

    const res = await request(app)
      .get('/api/auth/logout')
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', "Successfully logged out.");
  });

  it("Should return success, with no refresh token.", async () => {
    const email = `user+${uuidv4()}@example.com`;
    const password = "Dream@505";

    await request(app).post('/api/auth/register').send({ email, password });
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } });

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    const cookiesRaw = loginRes.headers['set-cookie'] || [];
    const cookiesArr: string[] = Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw];
    const accessCookie = cookiesArr.find((c: string) => c.startsWith('accessToken='));
    const cookieHeader = accessCookie ? accessCookie.split(';')[0] : "";

    const res = await request(app)
      .get('/api/auth/logout')
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', "Successfully logged out.");
  });

  it("Should return success.", async () => {
    const email = `user+${uuidv4()}@example.com`;
    const password = "Dream@505";

    await request(app).post('/api/auth/register').send({ email, password });
    await prisma.user.update({ where: { email }, data: { isEmailVerified: true } });

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    const cookieHeader = getCookies(loginRes);

    const res = await request(app)
      .get('/api/auth/logout')
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', "Successfully logged out.");
  });
});