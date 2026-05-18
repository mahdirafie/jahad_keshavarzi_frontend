import axios from 'axios';
import BASE_URL from './baseUrl';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,           // send httpOnly cookies on every request
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  // When sending FormData let the browser set Content-Type with the
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
