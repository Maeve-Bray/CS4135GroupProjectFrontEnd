import axios from "axios";
import { API_BASE_URL } from "./baseURL.js";

const REVIEWS = `${API_BASE_URL}/api/reviews`;

export const createTutorReview = (data) => {
  return axios.post(REVIEWS, data);
};

export const getReviewByBookingId = (bookingId) => {
  return axios.get(`${REVIEWS}/booking/${bookingId}`);
};

export const getTutorReviews = (tutorId) => {
  return axios.get(`${REVIEWS}/tutor/${tutorId}`);
};

export const getTutorAverageRating = (tutorId) => {
  return axios.get(`${REVIEWS}/tutor/${tutorId}/average`);
};