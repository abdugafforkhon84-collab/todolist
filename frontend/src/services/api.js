// Сервисный слой для взаимодействия с Backend API

// Автоматическое определение адреса хоста для работы как локально, так и на Render/в облаке
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${hostname}:8000`;
};

const BASE_URL = getBaseUrl();

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('crm_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

async function handleResponse(response) {
  if (response.status === 204) {
    return true;
  }
  
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    if (response.status === 401) {
      // Истек токен или не авторизован
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.dispatchEvent(new Event('auth_change'));
    }
    const message = data.detail || 'Произошла ошибка при выполнении запроса';
    throw new Error(message);
  }
  
  return data;
}

export const api = {
  // Аутентификация
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Записи клиентов
  async getRecords(tab = null, search = '') {
    const params = new URLSearchParams();
    if (tab) params.append('tab', tab);
    if (search) params.append('search', search);

    const url = `${BASE_URL}/api/records${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async getStats() {
    const res = await fetch(`${BASE_URL}/api/records/stats`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async getRecord(id) {
    const res = await fetch(`${BASE_URL}/api/records/${id}`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createRecord(recordData) {
    const res = await fetch(`${BASE_URL}/api/records`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(recordData),
    });
    return handleResponse(res);
  },

  async updateRecord(id, recordData) {
    const res = await fetch(`${BASE_URL}/api/records/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(recordData),
    });
    return handleResponse(res);
  },

  async addPayment(id, amount) {
    const res = await fetch(`${BASE_URL}/api/records/${id}/payment`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });
    return handleResponse(res);
  },

  async deleteRecord(id) {
    const res = await fetch(`${BASE_URL}/api/records/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },
};
