const BASE = import.meta.env.VITE_API_BASE_URL

function getHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function normalizeError(err) {
  if (typeof err.detail === "string") return err
  if (Array.isArray(err.detail)) {
    return { detail: err.detail.map((e) => e.msg).join("; ") }
  }
  if (err.detail?.message) {
    return { detail: err.detail.message }
  }
  return { detail: err.message || "Request failed" }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw normalizeError(err)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login: (body) => request("POST", "/auth/login", body),
  register: (body) => request("POST", "/auth/register", body),
  me: () => request("GET", "/auth/me"),
  dashboard: () => request("GET", "/dashboard"),
  getWorkouts: (params = {}) => request("GET", `/workouts?${new URLSearchParams(params)}`),
  getWorkout: (id) => request("GET", `/workouts/${id}`),
  createWorkout: (body) => request("POST", "/workouts", body),
  updateWorkout: (id, body) => request("PATCH", `/workouts/${id}`, body),
  deleteWorkout: (id) => request("DELETE", `/workouts/${id}`),
  analytics: (range = "6w") => request("GET", `/analytics?range=${range}`),
  analyticsExport: (range = "6w", format = "json") =>
    request("GET", `/analytics/export?range=${range}&format=${format}`),
  updateProfile: (body) => request("PATCH", "/profile", body),
  changePassword: (body) => request("PATCH", "/profile/password", body),
  deleteProfile: () => request("DELETE", "/profile"),
}

export function setToken(token) {
  localStorage.setItem("token", token)
  window.dispatchEvent(new Event("trackmygame-auth-change"))
}

export function clearToken() {
  const hadToken = Boolean(localStorage.getItem("token"))
  localStorage.removeItem("token")
  if (hadToken) {
    window.dispatchEvent(new Event("trackmygame-auth-change"))
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"))
}
