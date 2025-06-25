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
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: 'caleb3@example.com', password: '3'})
        expect(res.status).toBe(409)
        expect(res.body).toHaveProperty('error')
}); 
    it('should return 200 status: User added', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: 'caleb5@example.com', password: '5'})
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
}); 
})





