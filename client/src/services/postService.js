import api from './api';

export const getFeed = (page = 1, limit = 10) => api.get(`/posts/feed?page=${page}&limit=${limit}`);
export const getExplore = (page = 1, limit = 10) => api.get(`/posts/explore?page=${page}&limit=${limit}`);
export const getPost = (id) => api.get(`/posts/${id}`);
export const getUserPosts = (userId, page = 1) => api.get(`/posts/user/${userId}?page=${page}`);
export const createPost = (data) => {
  if (data instanceof FormData) {
    return api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/posts', data);
};
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const toggleLike = (id) => api.put(`/posts/${id}/like`);
export const addComment = (id, text) => api.post(`/posts/${id}/comment`, { text });
export const deleteComment = (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`);
