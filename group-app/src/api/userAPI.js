import axios from "axios";
import { API_BASE_URL } from "./baseURL.js";

const USERS = `${API_BASE_URL}/api/users`;

export const updateUserProfile = (userId, userData) => {
  return axios.put(`${USERS}/${userId}`, userData);
};