import axios from "axios";
import { API_BASE_URL } from "./baseURL.js";

const STUDENT_PROFILES = `${API_BASE_URL}/api/student-profiles`;

export const getStudentProfile = (userId) => {
  return axios.get(`${STUDENT_PROFILES}/${userId}`);
};

export const createStudentProfile = (profileData) => {
  return axios.post(STUDENT_PROFILES, profileData);
};

export const updateStudentProfile = (userId, profileData) => {
  return axios.put(`${STUDENT_PROFILES}/${userId}`, profileData);
};