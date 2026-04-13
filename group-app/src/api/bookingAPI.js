import axios from "axios";
import { API_BASE_URL } from "./baseURL.js";

const API = axios.create({
    baseURL: `${API_BASE_URL}/api/bookings`,
});

export const createBooking = (data)=>API.post("",data);
export const getStudentBookings = (studentId)=>API.get(`/student/${studentId}`);
export const getTutorBookings =(tutorId) =>API.get(`/tutor/${tutorId}`);
export const approveBooking = (id)=>API.put(`/${id}/approve`);
export const rejectBooking = (id)=>API.put(`/${id}/reject`);
export const cancelBooking = (id)=>API.put(`/${id}/cancel`);
export const completeBooking = (id)=>API.put(`/${id}/complete`);
export const getTutorSchedule = (tutorId, sessionDate)=>
    API.get(`/tutor/${tutorId}/schedule?sessionDate=${sessionDate}`);
