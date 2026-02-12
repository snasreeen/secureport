import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const safeMethods = ['get', 'head', 'options'];
  if (!safeMethods.includes(config.method)) {
    const token = sessionStorage.getItem('csrfToken');
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers['x-csrf-token'] = token;
    }
  }
  return config;
});

export default api;

