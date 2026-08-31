const { request, app, registerUser } = require('./helpers');

async function createVehicleFor(token) {
  const res = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${token}`)
    .send({ make: 'Ford', model: 'Focus' });
  return res.body.vehicle._id;
}

describe('Fault reports', () => {
  test('mechanics cannot create fault reports', async () => {
    const { token } = await registerUser({ role: 'mechanic' });
    const res = await request(app)
      .post('/api/faults')
      .set('Authorization', `Bearer ${token}`)
      .field('vehicle', '000000000000000000000000')
      .field('description', 'x');
    expect(res.status).toBe(403);
  });

  test('a customer reports a fault on their own vehicle', async () => {
    const customer = await registerUser({ role: 'customer' });
    const vehicleId = await createVehicleFor(customer.token);

    const res = await request(app)
      .post('/api/faults')
      .set('Authorization', `Bearer ${customer.token}`)
      .field('vehicle', vehicleId)
      .field('description', 'Engine noise');
    expect(res.status).toBe(201);
    expect(res.body.report.status).toBe('waiting_for_mechanic');
  });

  test('a customer cannot report a fault on a vehicle they do not own', async () => {
    const owner = await registerUser({ role: 'customer' });
    const attacker = await registerUser({ role: 'customer' });
    const vehicleId = await createVehicleFor(owner.token);

    const res = await request(app)
      .post('/api/faults')
      .set('Authorization', `Bearer ${attacker.token}`)
      .field('vehicle', vehicleId)
      .field('description', 'Not my car');
    expect(res.status).toBe(404);
  });

  test('any mechanic can view a report; other customers cannot', async () => {
    const customer = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const otherCustomer = await registerUser({ role: 'customer' });
    const vehicleId = await createVehicleFor(customer.token);

    const created = await request(app)
      .post('/api/faults')
      .set('Authorization', `Bearer ${customer.token}`)
      .field('vehicle', vehicleId)
      .field('description', 'Brakes squeal');
    const reportId = created.body.report._id;

    const asMechanic = await request(app)
      .get(`/api/faults/${reportId}`)
      .set('Authorization', `Bearer ${mechanic.token}`);
    expect(asMechanic.status).toBe(200);
    // Regression test for a bug found during manual testing: populating the
    // customer field must never leak the password hash.
    expect(JSON.stringify(asMechanic.body)).not.toMatch(/"password"/);

    const asOtherCustomer = await request(app)
      .get(`/api/faults/${reportId}`)
      .set('Authorization', `Bearer ${otherCustomer.token}`);
    expect(asOtherCustomer.status).toBe(403);
  });

  test('a customer cannot list all reports (mechanic-only dashboard route)', async () => {
    const { token } = await registerUser({ role: 'customer' });
    const res = await request(app).get('/api/faults').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a mechanic sending a quote moves the report to under_review and notifies the customer', async () => {
    const customer = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const vehicleId = await createVehicleFor(customer.token);

    const created = await request(app)
      .post('/api/faults')
      .set('Authorization', `Bearer ${customer.token}`)
      .field('vehicle', vehicleId)
      .field('description', 'AC not cooling');
    const reportId = created.body.report._id;

    const quoted = await request(app)
      .put(`/api/faults/${reportId}/quote`)
      .set('Authorization', `Bearer ${mechanic.token}`)
      .send({ price: 120, estimatedTime: '1 day' });
    expect(quoted.status).toBe(200);
    expect(quoted.body.report.status).toBe('under_review');

    const notifications = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(notifications.body.notifications.some((n) => n.type === 'mechanic_replied')).toBe(true);
  });
});
