// Use VITE_API_URL in production, otherwise default to local dev server
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api';

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include', // send session cookie
    ...options,
  };
  const response = await fetch(url, config);
  const data = await response.json();
  if (!response.ok) {
    // Normalise error shape
    const message =
      data?.message ||
      (Array.isArray(data?.errors) ? data.errors.map((e) => e.msg).join(', ') : 'Something went wrong');
    throw new Error(message);
  }
  return data;
};

export const api = {
  post: (endpoint, body) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  get: (endpoint) =>
    request(endpoint, { method: 'GET' }),
};
