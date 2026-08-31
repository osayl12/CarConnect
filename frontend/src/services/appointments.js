import api from './api';

export const createSlot = (payload) =>
  api.post('/appointments', payload).then((r) => r.data.appointment);

export const listMySlots = () => api.get('/appointments/mine').then((r) => r.data.appointments);

export const listAvailableSlots = () =>
  api.get('/appointments/available').then((r) => r.data.appointments);

export const listMyBookings = () =>
  api.get('/appointments/my-bookings').then((r) => r.data.appointments);

export const requestSlot = (id, faultReportId) =>
  api.patch(`/appointments/${id}/request`, { faultReportId }).then((r) => r.data.appointment);

export const confirmSlot = (id) =>
  api.patch(`/appointments/${id}/confirm`).then((r) => r.data.appointment);

export const cancelSlot = (id) =>
  api.patch(`/appointments/${id}/cancel`).then((r) => r.data.appointment);
