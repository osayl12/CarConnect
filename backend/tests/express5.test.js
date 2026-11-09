const { request, app } = require('./helpers');

// Express 5 leaves req.body undefined when no body parser runs. These
// requests must get a normal 4xx, not a 500 "Cannot destructure" crash.
describe('Requests without a JSON body', () => {
  test('login with no body returns 400', async () => {
    const res = await request(app).post('/api/auth/login');
    expect(res.status).toBe(400);
  });

  test('register with a non-JSON body returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(res.status).toBe(400);
  });
});
