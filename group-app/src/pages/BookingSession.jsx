import {useState} from "react";
import {createBooking} from "../api/bookingAPI";

export default function BookSession({ studentId, tutorId}) {
    const [formData, setFormData] = useState({
        studentId:studentId,
        tutorId: tutorId,
        skill: "",
        sessionDate: "",
        startTime: "",
        endTime: "",
        durationMinutes: "",
        notes: "",
    });

    const [message, setMessage]=useState("");

    const tutorOptions = [
  { userId: 2, name: "John Murphy" },
  { userId: 3, name: "Aisha Khan" },
  { userId: 4, name: "Emily Walsh" },
];

    const handleChange = (e)=>{
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();

        try{
            await createBooking(formData);
            setMessage("Booking request submitted sucessfully.");
            setFormData({
                ...formData,
                skill:"",
                sessionDate:"",
                startTime: "",
                endTime:"",
                durationMinutes:"",
                notes:"",
            });
        }catch (error){
            setMessage(error.response?.data?.message || "Failed to submit booking.");
        }
        };

        return (
            <div>
                <h2>Book a Session</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        name="skill"
                        placeholder="Skill"
                        value={formData.skill}
                        onChange={handleChange}
                        />
                    
                    <input
                        type="date"
                        name="sessionDate"
                        value={formData.sessionDate}
                        onChange={handleChange}
                    />
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                    />
                    <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                    />
                    <select
                        name="tutorId"
                        value={formData.tutorId}
                        onChange={handleChange}
                    >
                    <option value="">Select a tutor</option>
                        {tutorOptions.map((tutor) => (
                        <option key={tutor.userId} value={tutor.userId}>
                        {tutor.name}
                    </option>
                    ))}
                    </select>
                    <textarea
                        name="notes"
                        placeholder="Notes"
                        value={formData.notes}
                        onChange={handleChange}
                    />
                    <button type ="submit">Request Session</button>
                </form>

                {message && <p>{message}</p>}
            </div>
        );
    }
