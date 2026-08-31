import api from './api';

export const createFaultReport = (formData) =>
  api.post('/faults', formData).then((r) => r.data.report);

export const listMyFaultReports = () => api.get('/faults/mine').then((r) => r.data.reports);

export const listAllFaultReports = (params) =>
  api.get('/faults', { params }).then((r) => r.data.reports);

export const getFaultReport = (id) => api.get(`/faults/${id}`).then((r) => r.data.report);
