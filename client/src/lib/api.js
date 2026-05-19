const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const TOKEN_KEY = 'trackmygame_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event('trackmygame-auth-change'))
}

export function clearToken() {
  const hadToken = Boolean(localStorage.getItem(TOKEN_KEY))
  localStorage.removeItem(TOKEN_KEY)
  if (hadToken) {
    window.dispatchEvent(new Event('trackmygame-auth-change'))
  }
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearToken()
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message =
      typeof payload?.detail === 'string'
        ? payload.detail
        : payload?.detail?.message || 'Request failed'
    throw new Error(message)
  }

  return payload
}

export const authApi = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest('/auth/me'),
}

export const profileApi = {
  update: (payload) => apiRequest('/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  updatePassword: (payload) => apiRequest('/profile/password', { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: () => apiRequest('/profile', { method: 'DELETE' }),
}

export const workoutsApi = {
  list: ({ page = 1, limit = 5 } = {}) => apiRequest(`/workouts?page=${page}&limit=${limit}`),
  get: (id) => apiRequest(`/workouts/${id}`),
  create: (payload) => apiRequest('/workouts', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/workouts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => apiRequest(`/workouts/${id}`, { method: 'DELETE' }),
}

export const dashboardApi = {
  get: () => apiRequest('/dashboard'),
}

export const analyticsApi = {
  get: () => apiRequest('/analytics'),
  export: () => apiRequest('/analytics/export'),
}
