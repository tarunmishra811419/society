// Central place that knows how to talk to the Django backend: builds the
// URL, attaches the login token, and retries once if the token expired.
// Every page will import `api` from here instead of reading mockData.js.

const BASE_URL = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return localStorage.getItem("access_token");
}
function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}
function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}
function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token available.");

  const res = await fetch(`${BASE_URL}/auth/login/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) throw new Error("Session expired.");

  const data = await res.json();
  setTokens({ access: data.access });
  return data.access;
}

async function request(path, { method = "GET", body, auth = true, retry = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Access token expired — try refreshing once, then retry the original request.
  if (res.status === 401 && auth && retry) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, auth, retry: false });
    } catch {
      clearTokens();
      window.location.href = "/";
      throw new Error("Session expired, please log in again.");
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Matches config/exceptions.py's error shape: { error: { message, detail } }
    const message = data?.error?.message || data?.detail || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export async function login(username, password) {
  const data = await request("/auth/login/", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
  setTokens(data);
  return data;
}

export function logout() {
  clearTokens();
}

export { getAccessToken };