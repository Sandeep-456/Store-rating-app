// tests/auth.test.js
const request = require('supertest');
const app = require('../server'); // import your Express app

describe('Auth API', () => {
  it('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      password: 'Test@123',
      address: 'India',
      role: 'user'
    });
    expect(res.statusCode).toBe(400);
  });
});
