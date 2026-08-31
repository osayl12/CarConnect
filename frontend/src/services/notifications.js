import api from './api';

export const listNotifications = () => api.get('/notifications').then((r) => r.data);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data.notification);

export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
