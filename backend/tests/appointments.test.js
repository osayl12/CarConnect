const { request, app, registerUser } = require('./helpers');

async function createReportFor(customerToken) {
  const vehicle = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ make: 'Mazda', model: '3' });

  const report = await request(app)
    .post('/api/faults')
    .set('Authorization', `Bearer ${customerToken}`)
    .field('vehicle', vehicle.body.vehicle._id)
    .field('description', "Won't start");

  return report.body.report._id;
}

describe('Appointments', () => {
  test('mechanic defines a slot, customer requests it, mechanic confirms — report status syncs', async () => {
    const customer = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const reportId = await createReportFor(customer.token);

    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const slot = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${mechanic.token}`)
      .send({ startTime: future });
    expect(slot.status).toBe(201);
    const slotId = slot.body.appointment._id;

    const available = await request(app)
      .get('/api/appointments/available')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(available.body.appointments.some((a) => a._id === slotId)).toBe(true);

    const requested = await request(app)
      .patch(`/api/appointments/${slotId}/request`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ faultReportId: reportId });
    expect(requested.status).toBe(200);
    expect(requested.body.appointment.status).toBe('requested');

    const confirmed = await request(app)
      .patch(`/api/appointments/${slotId}/confirm`)
      .set('Authorization', `Bearer ${mechanic.token}`);
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.appointment.status).toBe('confirmed');

    const report = await request(app)
      .get(`/api/faults/${reportId}`)
      .set('Authorization', `Bearer ${customer.token}`);
    expect(report.body.report.status).toBe('appointment_scheduled');
  });

  test('a report cannot have two active appointments at once', async () => {
    const customer = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const reportId = await createReportFor(customer.token);

    const makeSlot = () =>
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${mechanic.token}`)
        .send({ startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() });

    const slot1 = (await makeSlot()).body.appointment._id;
    const slot2 = (await makeSlot()).body.appointment._id;

    await request(app)
      .patch(`/api/appointments/${slot1}/request`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ faultReportId: reportId });

    const secondRequest = await request(app)
      .patch(`/api/appointments/${slot2}/request`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ faultReportId: reportId });
    expect(secondRequest.status).toBe(409);
  });

  test('cancelling a confirmed appointment reverts the report status', async () => {
    const customer = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const reportId = await createReportFor(customer.token);

    const slot = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${mechanic.token}`)
      .send({ startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() });
    const slotId = slot.body.appointment._id;

    await request(app)
      .patch(`/api/appointments/${slotId}/request`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ faultReportId: reportId });
    await request(app)
      .patch(`/api/appointments/${slotId}/confirm`)
      .set('Authorization', `Bearer ${mechanic.token}`);

    const cancelled = await request(app)
      .patch(`/api/appointments/${slotId}/cancel`)
      .set('Authorization', `Bearer ${customer.token}`);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.appointment.status).toBe('cancelled');

    const report = await request(app)
      .get(`/api/faults/${reportId}`)
      .set('Authorization', `Bearer ${customer.token}`);
    expect(report.body.report.status).toBe('under_review');
  });

  test('an unrelated customer cannot cancel someone else\'s appointment', async () => {
    const customer = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const stranger = await registerUser({ role: 'customer' });
    const reportId = await createReportFor(customer.token);

    const slot = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${mechanic.token}`)
      .send({ startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() });
    const slotId = slot.body.appointment._id;

    await request(app)
      .patch(`/api/appointments/${slotId}/request`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ faultReportId: reportId });

    const res = await request(app)
      .patch(`/api/appointments/${slotId}/cancel`)
      .set('Authorization', `Bearer ${stranger.token}`);
    expect(res.status).toBe(403);
  });

  test('rejects a slot in the past', async () => {
    const { token } = await registerUser({ role: 'mechanic' });
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ startTime: new Date(Date.now() - 1000).toISOString() });
    expect(res.status).toBe(400);
  });
});
