import axios from 'axios';
import BASE_URL from './baseUrl';

const adminApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,           // send httpOnly cookies on every request
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401: attempt silent token rotation via the refresh endpoint.
// The browser automatically sends the httpOnly refresh-token cookie.
// On repeated failure: redirect to /dashboard/login.
let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error) => {
  pendingRequests.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  pendingRequests = [];
};

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const shouldRetry = status === 401 && !originalRequest._retry;

    if (shouldRetry) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then(() => adminApiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The httpOnly refresh-token cookie is sent automatically.
        // No body or manual token needed.
        await axios.post(
          `${BASE_URL}/admin/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return adminApiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
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
