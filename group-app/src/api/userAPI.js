import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/users";

export const updateUserProfile = (userId, userData) => {
  return axios.put(`${API_BASE_URL}/${userId}`, userData);
};