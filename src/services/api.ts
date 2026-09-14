import axios from 'axios';

const BASE_URL = process.env.VITE_BACKEND_BASE_URL ;

export const setToken = (token: string): void => {
  sessionStorage.setItem('accessToken', token);
};

export const clearToken = (): void => {
  sessionStorage.removeItem('accessToken');
};

export const getToken = (): string | null => {
  return sessionStorage.getItem('accessToken');
};



 const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Request Interceptor: Automatically inject the access token into every outgoing API request
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Capture tokens from backend responses or handle token refresh logic
API.interceptors.response.use(
  (response) => {
    if (response.data && response.data.accessToken) {
      sessionStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Guardrail: If the refresh call itself fails, break the infinite loop immediately
    if (originalRequest.url?.includes('/auth/refresh')) {
      sessionStorage.removeItem('accessToken');
      window.location.href = '/login'; // Redirect to log out the user
      return Promise.reject(error);
    }

    // 2. Handle standard protected endpoint 401 expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true } 
        );

        const newAccessToken = refreshResponse.data.accessToken;
        sessionStorage.setItem('accessToken', newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        // Re-execute original failed request using the named instance
        return API(originalRequest);
      } catch (refreshError) {
        // Break loop if token rotation fails
        sessionStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
