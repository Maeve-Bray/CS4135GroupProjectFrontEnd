import axios from "axios";
import { API_BASE_URL } from "./baseURL.js";

const REVIEWS = `${API_BASE_URL}/api/reviews`;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const createTutorReview = (data) => {
  return axios.post(REVIEWS, data, { headers: authHeaders() });
};

export const getReviewByBookingId = (bookingId) => {
  return axios.get(`${REVIEWS}/booking/${bookingId}`, { headers: authHeaders() });
};

export const getTutorReviews = (tutorId) => {
  return axios.get(`${REVIEWS}/tutor/${tutorId}`, { headers: authHeaders() });
};

export const getTutorAverageRating = (tutorId) => {
  return axios.get(`${REVIEWS}/tutor/${tutorId}/average`, { headers: authHeaders() });
};