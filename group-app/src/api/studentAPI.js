import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/student-profiles";

export const getStudentProfile = (userId) => {
  return axios.get(`${API_BASE_URL}/${userId}`);
};

export const createStudentProfile = (profileData) => {
  return axios.post(API_BASE_URL, profileData);
};

export const updateStudentProfile = (userId, profileData) => {
  return axios.put(`${API_BASE_URL}/${userId}`, profileData);
};