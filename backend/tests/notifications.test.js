const { request, app, registerUser } = require('./helpers');

async function createReportFor(customerToken) {
  const vehicle = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ make: 'Kia', model: 'Rio' });

  const report = await request(app)
    .post('/api/faults')
    .set('Authorization', `Bearer ${customerToken}`)
    .field('vehicle', vehicle.body.vehicle._id)
    .field('description', 'AC not cooling');

  return report.body.report._id;
}

describe('Notifications', () => {
  test('mechanics cannot access the notifications endpoint', async () => {
    const { token } = await registerUser({ role: 'mechanic' });
    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('manually changing status notifies the customer', async () => {
    const customer = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const reportId = await createReportFor(customer.token);

    await request(app)
      .patch(`/api/faults/${reportId}/status`)
      .set('Authorization', `Bearer ${mechanic.token}`)
      .send({ status: 'repaired' });

    const list = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(list.body.notifications.some((n) => n.type === 'status_changed')).toBe(true);
    expect(list.body.unreadCount).toBe(1);
  });

  test('mark-one-read and mark-all-read update unread count; other users are isolated', async () => {
    const customer = await registerUser({ role: 'customer' });
    const stranger = await registerUser({ role: 'customer' });
    const mechanic = await registerUser({ role: 'mechanic' });
    const reportId = await createReportFor(customer.token);

    await request(app)
      .patch(`/api/faults/${reportId}/status`)
      .set('Authorization', `Bearer ${mechanic.token}`)
      .send({ status: 'under_review' });
    await request(app)
      .patch(`/api/faults/${reportId}/status`)
      .set('Authorization', `Bearer ${mechanic.token}`)
      .send({ status: 'repaired' });

    const list = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(list.body.unreadCount).toBe(2);
    const firstId = list.body.notifications[0]._id;

    // A stranger can't mark someone else's notification read.
    const strangerAttempt = await request(app)
      .patch(`/api/notifications/${firstId}/read`)
      .set('Authorization', `Bearer ${stranger.token}`);
    expect(strangerAttempt.status).toBe(404);

    const markedOne = await request(app)
      .patch(`/api/notifications/${firstId}/read`)
      .set('Authorization', `Bearer ${customer.token}`);
    expect(markedOne.status).toBe(200);

    const afterOne = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(afterOne.body.unreadCount).toBe(1);

    await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${customer.token}`);

    const afterAll = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customer.token}`);
    expect(afterAll.body.unreadCount).toBe(0);
  });
});
