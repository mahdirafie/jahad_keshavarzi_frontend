import axios from 'axios';
import BASE_URL from './baseUrl';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  // Only inject the user token if no Authorization header has been explicitly set
  // (admin calls pass adminAccessToken directly and must not be overwritten)
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData let the browser auto-set Content-Type with the
  // multipart boundary — the hardcoded JSON default must be removed.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    error.message =
      error.response?.data?.message || error.message || 'خطای ناشناخته';
    return Promise.reject(error);
  }
);

export default apiClient;
