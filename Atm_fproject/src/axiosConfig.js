import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/', // <--- use localhost, not 127.0.0.1
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to automatically include CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get CSRF token from cookies
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    const csrfToken = match ? match[1] : null;
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle CSRF errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {

    // ✅ Handle session expiry
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Session expired — clear any local state & redirect
      localStorage.removeItem('isLoggedIn');
      window.location.href = "/signin";
      return;
    }

    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      // Try to get a new CSRF token
      try {
        await axiosInstance.get('get-csrf/');
        await axios.get('http://127.0.0.1:8000/api/get-csrf/', {
          withCredentials: true
        });
        // Retry the original request
        const originalRequest = error.config;
        const match = document.cookie.match(/csrftoken=([^;]+)/);
        const csrfToken = match ? match[1] : null;
        if (csrfToken) {
          originalRequest.headers['X-CSRFToken'] = csrfToken;
        }
        return axiosInstance(originalRequest);
      } catch (csrfError) {
        console.error('Failed to get CSRF token:', csrfError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;