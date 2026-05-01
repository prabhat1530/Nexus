import api from './api';

export const getConversations = () => api.get('/messages/conversations');
export const createOrGetConversation = (participantId) => api.post('/messages/conversations', { participantId });
export const getMessages = (conversationId, page = 1) => api.get(`/messages/${conversationId}?page=${page}`);
export const sendMessage = (conversationId, data) => api.post(`/messages/${conversationId}`, data);
export const markMessagesRead = (conversationId) => api.put(`/messages/${conversationId}/read`);
export const getIceServers = () => api.get('/turn');
