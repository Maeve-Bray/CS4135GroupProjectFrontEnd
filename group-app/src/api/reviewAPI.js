import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/reviews";

export const createTutorReview = (data) => {
  return axios.post(API_BASE_URL, data);
};

export const getReviewByBookingId = (bookingId) => {
  return axios.get(`${API_BASE_URL}/booking/${bookingId}`);
};

export const getTutorReviews = (tutorId) => {
  return axios.get(`${API_BASE_URL}/tutor/${tutorId}`);
};

export const getTutorAverageRating = (tutorId) => {
  return axios.get(`${API_BASE_URL}/tutor/${tutorId}/average`);
};