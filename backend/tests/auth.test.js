const { request, app, registerUser } = require('./helpers');

describe('Auth', () => {
  test('registers a customer and returns a token without the password hash', async () => {
    const { user, token } = await registerUser({ role: 'customer' });
    expect(token).toBeDefined();
    expect(user.password).toBeUndefined();
    expect(user.role).toBe('customer');
  });

  test('rejects duplicate email registration', async () => {
    const email = 'dupe@example.com';
    await registerUser({ email });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Another',
      email,
      password: 'password123',
      role: 'customer',
    });
    expect(res.status).toBe(409);
  });

  test('rejects an invalid role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad Role',
      email: 'badrole@example.com',
      password: 'password123',
      role: 'admin',
    });
    expect(res.status).toBe(400);
  });

  test('logs in with correct credentials, rejects wrong password', async () => {
    const { payload } = await registerUser({ email: 'login@example.com', password: 'correct123' });

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeDefined();
    expect(ok.body.user.password).toBeUndefined();

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: 'wrong' });
    expect(bad.status).toBe(401);
  });

  test('protected /me requires a valid token', async () => {
    const noToken = await request(app).get('/api/auth/me');
    expect(noToken.status).toBe(401);

    const { token } = await registerUser();
    const withToken = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(withToken.status).toBe(200);
    expect(withToken.body.user.password).toBeUndefined();
  });
});
