import api from "./api";

export async function login(email, password) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  const result = response.data;

  if (!result.success || !result.data?.token) {
    throw new Error(result.message || "Login failed");
  }

  localStorage.setItem("landsafe_token", result.data.token);
  localStorage.setItem(
    "landsafe_user",
    JSON.stringify(result.data.user)
  );

  return result.data;
}

export async function register(name, email, password) {
  const response = await api.post("/api/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
}

export async function getProfile() {
  const response = await api.get("/api/auth/profile");

  return response.data;
}

export function logout() {
  localStorage.removeItem("landsafe_token");
  localStorage.removeItem("landsafe_user");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("landsafe_token"));
}

export function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("landsafe_user") || "null"
    );
  } catch {
    return null;
  }
}