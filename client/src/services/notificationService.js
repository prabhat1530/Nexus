import api from './api';

export const getNotifications = (page = 1) => api.get(`/notifications?page=${page}`);
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAllRead = () => api.put('/notifications/read');
export const markOneRead = (id) => api.put(`/notifications/${id}/read`);
