const http = require('http');
const request = require('supertest');
const expressApp = require('../src/app');

// One shared HTTP server per test file, closed in afterAll. Passing a bare
// Express app to supertest makes it open a new server for every request(),
// and if a test throws between request(app).post(...) and `await`, that
// server is never closed and Jest hangs forever instead of exiting.
const app = http.createServer(expressApp);
beforeAll((done) => {
  app.listen(0, done);
});
afterAll((done) => {
  app.close(done);
});

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
