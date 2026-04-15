const normalizeBaseUrl = (value?: string) => {
  const fallback = 'http://localhost:3000';
  const base = value?.trim() || fallback;
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const API_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const API = {
  parts: `${API_URL}/parts`,
  users: `${API_URL}/users`,
  customers: `${API_URL}/customers`,
  orders: `${API_URL}/orders`,
};
