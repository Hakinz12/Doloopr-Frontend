import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const getTasks = async () => {
    const response = await api.get('/api/tasks');
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
};

export const updateTask = async (id, taskData) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
};

export const submitFeedback = async (message) => {
    const response = await api.post('/api/feedback', { message });
    return response.data;
};

export default api;