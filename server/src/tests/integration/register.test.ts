import request from 'supertest';
import app from '../../app';
import prisma from "../../lib/prisma"
import {v4 as uuidv4} from "uuid";

beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.tokenBlacklist.deleteMany()
})

afterAll(async () => {
    await prisma.$disconnect();
})

describe('POST /api/auth/register', () => {
    it('should return error: An email and password are both required.', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: 'test@example.com', password: ''})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
}); 
    it('should return error: An email and password are both required.', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: '', password: '12345'})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
}); 
    it('should return error: User already registered', async () => {
        const email = `user+${uuidv4()}@example.com`
        await request(app).post('/api/auth/register').send({email: email, password: '3'})
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: email, password: '3'})
        expect(res.status).toBe(409)
        expect(res.body).toHaveProperty('error')
}); 
    it('should return 200 status: User added', async () => {
        const email = `user+${uuidv4()}@example.com`
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: email, password: '5'})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
}); 
})





