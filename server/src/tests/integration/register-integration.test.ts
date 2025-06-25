import request from 'supertest';
import app from '../../app';
import prisma from "../../lib/prisma"

beforeAll(async () => {
    await prisma.user.deleteMany();
    const res = await request(app)
    .post('/api/auth/register')
    .send({email: 'caleb3@example.com', password: '3'})
})

afterAll(async () => {
    await prisma.$disconnect();
})

describe('POST /api/auth/register', () => {
    it('should return error: User already registered', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: 'caleb3@example.com', password: '3'})
        expect(res.status).toBe(409)
        expect(res.body).toHaveProperty('error')
}); 
})
