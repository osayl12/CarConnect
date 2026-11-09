const { request, app } = require('./helpers');

// Behind Caddy, every request arrives from the proxy's IP. The limiter must
// key on the X-Forwarded-For client IP, or one visitor's failed logins would
// block login for everyone.
describe('Login rate limit behind the proxy', () => {
  const login = (ip) =>
    request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', ip)
      .send({ email: 'nobody@example.com', password: 'wrong-password' });

  test('limits one client IP without blocking another', async () => {
    for (let i = 0; i < 20; i += 1) {
      const res = await login('203.0.113.10');
      expect(res.status).not.toBe(429);
    }

    expect((await login('203.0.113.10')).status).toBe(429);
    expect((await login('198.51.100.20')).status).not.toBe(429);
  });
});
