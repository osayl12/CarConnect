const request = require('supertest');
const app = require('../src/app');

async function registerUser(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: `user${Date.now()}${Math.random().toString(36).slice(2)}@example.com`,
    password: 'password123',
    role: 'customer',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { ...res.body, payload };
}

module.exports = { request, app, registerUser };
