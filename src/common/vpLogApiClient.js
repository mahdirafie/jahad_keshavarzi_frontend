import axios from 'axios';

const VP_LOG_BASE_URL =
  process.env.REACT_APP_VP_LOG_BASE_URL || 'http://localhost:3001';

const vpLogApiClient = axios.create({
  baseURL: VP_LOG_BASE_URL,
  timeout: 15000,
  withCredentials: true,           // send httpOnly cookies on every request
  headers: { 'Content-Type': 'application/json' },
});

// On 401 redirect to dashboard login
vpLogApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/dashboard/login') {
        window.location.href = '/dashboard/login';
      }
    }
    error.message =
      error.response?.data?.message || error.message || 'خطای ناشناخته';
    return Promise.reject(error);
  }
);

export default vpLogApiClient;
