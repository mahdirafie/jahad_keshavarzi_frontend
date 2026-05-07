import axios from 'axios';
import BASE_URL from './baseUrl';

const adminApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Always attach the admin access token (never the user authToken)
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAccessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401: attempt silent token rotation, then retry the original request once.
// On repeated failure: clear tokens and redirect to /dashboard/login.
let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingRequests = [];
};

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const shouldRetry = status === 401 && !originalRequest._retry;

    if (shouldRetry) {
      const refreshToken = localStorage.getItem('adminRefreshToken');

      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(normaliseError(error));
      }

      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminApiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/admin/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem('adminAccessToken', data.access_token);
        localStorage.setItem('adminRefreshToken', data.refresh_token);

        adminApiClient.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        processQueue(null, data.access_token);
        return adminApiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        redirectToLogin();
        return Promise.reject(normaliseError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normaliseError(error));
  }
);

const normaliseError = (error) => {
  error.message =
    error.response?.data?.message || error.message || 'خطای ناشناخته';
  return error;
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/dashboard/login') {
    window.location.href = '/dashboard/login';
  }
};

export default adminApiClient;
