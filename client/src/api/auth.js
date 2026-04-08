import api from './axiosInstance';

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, phone?: string }} payload
 */
export const registerUser = (payload) => api.post('/auth/register', payload);

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} payload
 */
export const loginUser = (payload) => api.post('/auth/login', payload);

/**
 * Get the currently authenticated user's profile.
 * Requires valid JWT (auto-attached by axiosInstance interceptor).
 */
export const getMe = () => api.get('/auth/me');
