import axios from "axios";
import { API_BASE_URL } from "./baseURL.js";

const API = axios.create({
    baseURL: `${API_BASE_URL}/api/tutors`,
});

/** Distinct non-empty skill names from all tutor profiles (sorted). */
export const getTutorSkillNames = () => API.get("/skills");

export const getTutors = (filters = {}) => {
    const searchParams = new URLSearchParams();
    if (filters.skill) searchParams.append("skill", filters.skill);
    if (filters.q) searchParams.append("q", filters.q);
    if (filters.proficiencyLevel) searchParams.append("proficiencyLevel", filters.proficiencyLevel);
    if (filters.verifiedOnly !== undefined) searchParams.append("verifiedOnly", filters.verifiedOnly);
    if (filters.minRating !== undefined) searchParams.append("minRating", filters.minRating);
    const query = searchParams.toString();
    return API.get(query ? `/search?${query}` : "/search");
};

export const getTutorProfile = (tutorId)=>API.get(`/profile/${tutorId}`);
export const createTutorProfile = (data)=>API.post("/profile",data);
export const updateTutorProfile = (tutorId,data)=>API.put(`/profile/${tutorId}`,data);