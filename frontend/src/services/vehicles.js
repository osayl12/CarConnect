import api from './api';

export const listVehicles = () => api.get('/vehicles').then((r) => r.data.vehicles);
export const createVehicle = (payload) => api.post('/vehicles', payload).then((r) => r.data.vehicle);
export const updateVehicle = (id, payload) =>
  api.put(`/vehicles/${id}`, payload).then((r) => r.data.vehicle);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
