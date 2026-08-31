const { request, app, registerUser } = require('./helpers');

describe('Vehicles', () => {
  test('mechanics cannot access vehicle routes', async () => {
    const { token } = await registerUser({ role: 'mechanic' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Toyota', model: 'Corolla' });
    expect(res.status).toBe(403);
  });

  test('rejects a vehicle without make/model', async () => {
    const { token } = await registerUser({ role: 'customer' });
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ color: 'red' });
    expect(res.status).toBe(400);
  });

  test('a customer can manage only their own vehicle', async () => {
    const owner = await registerUser({ role: 'customer' });
    const other = await registerUser({ role: 'customer' });

    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ make: 'Honda', model: 'Civic' });
    expect(created.status).toBe(201);
    const vehicleId = created.body.vehicle._id;

    const ownerView = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(ownerView.status).toBe(200);

    // Never reveals that a vehicle exists for a non-owner.
    const otherView = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(otherView.status).toBe(404);

    const otherDelete = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(otherDelete.status).toBe(404);

    const ownerUpdate = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ color: 'blue' });
    expect(ownerUpdate.status).toBe(200);
    expect(ownerUpdate.body.vehicle.color).toBe('blue');
  });

  test('a malformed vehicle id returns 400, not a 500', async () => {
    const { token } = await registerUser({ role: 'customer' });
    const res = await request(app)
      .get('/api/vehicles/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
