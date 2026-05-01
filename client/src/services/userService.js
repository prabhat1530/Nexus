import api from './api';

export const getMe = () => api.get('/users/me');
export const getUserById = (id) => api.get(`/users/${id}`);
export const searchUsers = (q) => api.get(`/users/search?q=${q}`);
export const updateProfile = (data) => {
  if (data instanceof FormData) {
    return api.post('/users/profile', data);
  }
  return api.post('/users/profile', data);
};
export const toggleFollow = (id) => api.put(`/users/follow/${id}`);
export const getFollowers = (id) => api.get(`/users/${id}/followers`);
export const getFollowing = (id) => api.get(`/users/${id}/following`);
export const getSuggestions = () => api.get('/users/suggestions');
