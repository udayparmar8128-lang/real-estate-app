import axios from 'axios';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Development:  uses Vite proxy → requests to /api are proxied to localhost:5000
// Production:   set VITE_API_URL=https://your-backend.onrender.com/api in Vercel env vars
const api = axios.create({
  baseURL: "https://real-estate-app-tp3i.onrender.com/api",
  timeout: 15000,
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Attach JWT token if present
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    // Let the browser set Content-Type with the correct multipart boundary.
    delete config.headers['Content-Type'];
    delete config.headers.common?.['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Token expired / invalid → force logout
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
