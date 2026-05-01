import api from './api';

export const getStories = () => api.get('/stories/feed');
export const createStory = (formData) => api.post('/stories', formData);
export const markStoryViewed = (storyId) => api.post(`/stories/${storyId}/view`);
export const deleteStory = (storyId) => api.delete(`/stories/${storyId}`);
