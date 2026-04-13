import { API_BASE_URL } from "./baseURL.js";

const API_BASE = `${API_BASE_URL}/api/auth`;

export async function registerUser(data) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
}

export async function loginUser(data) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}
import axios from "axios";

export const updateMyProfile = (userId, data) => {
  return axios.put(`${API_BASE_URL}/api/auth/profile/${userId}`, data);
};
export const getMyProfile = (userId) => {
  return axios.get(`${API_BASE_URL}/api/auth/profile/${userId}`);
};