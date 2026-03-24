import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api/tutors",
});

export const getTutors = (filters = {}) => {
    const searchParams = new URLSearchParams();
    if (filters.skill) searchParams.append("skill", filters.skill);
    if (filters.verifiedOnly !== undefined) searchParams.append("verifiedOnly", filters.verifiedOnly);
    if (filters.minRating !== undefined) searchParams.append("minRating", filters.minRating);
    const query = searchParams.toString();
    return API.get(query ? `/search?${query}` : "/search");
};

export const getTutorProfile = (tutorId)=>API.get(`/profile/${tutorId}`);
export const createTutorProfile = (data)=>API.post("/profile",data);
export const updateTutorProfile = (tutorId,data)=>API.put(`/profile/${tutorId}`,data);
