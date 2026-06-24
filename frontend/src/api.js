const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

// Auth
export const register = (body) =>
  request("/api/auth/register", { method: "POST", body: JSON.stringify(body) });

export const login = (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    return data;
  });
};

export const getMe = () => request("/api/auth/me");

// Expenses
export const getExpenses = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.append(k, v);
  });
  const query = qs.toString();
  return request(`/api/expenses${query ? `?${query}` : ""}`);
};

export const createExpense = (body) =>
  request("/api/expenses", { method: "POST", body: JSON.stringify(body) });

export const updateExpense = (id, body) =>
  request(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteExpense = (id) =>
  request(`/api/expenses/${id}`, { method: "DELETE" });

export const getExpenseSummary = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.append(k, v);
  });
  const query = qs.toString();
  return request(`/api/expenses/summary${query ? `?${query}` : ""}`);
};

export const getOptions = () => request("/api/expenses/options");
