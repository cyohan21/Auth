import request from 'supertest';
import app from '../../app';

describe('POST /api/auth/register', () => {
    it('should return an error', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({email: 'test@example.com', password: ''})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
}); 
})