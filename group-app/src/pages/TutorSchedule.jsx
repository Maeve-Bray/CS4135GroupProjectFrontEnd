import { useState } from "react";
import {getTutorSchedule} from "../api/bookingAPI";

export default function TutorSchedule({tutorId}){
    const [sessionDate, setSessionDate] = useState("");
    const [bookings, setBookings]=useState([]);

    const handleLoadSchedule = async () => {
        try {
            const response = await getTutorSchedule(tutorId, sessionDate);
            setBookings(response.data);
        }catch (error){
            console.error("Error loading schedule", error);
        }
    };

    return (
        <div>
            <h2>Tutor Schedule</h2>

            <input
                type="date"
                value={sessionDate}
                onChange={(e)=>setSessionDate(e.target.value)}
            />
            <button onClick={handleLoadSchedule}>Load Schedule</button>

            {bookings.length===0?(
                <p>No approved bookings for this date.</p>
            ):(
                <table border="1" cellPadding="8">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Skill</th>
                            <th>Date</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking)=> (
                            <tr key ={booking.id}>
                                <td>{booking.studentId}</td>
                                <td>{booking.skill}</td>
                                <td>{booking.sessionDate}</td>
                                <td>{booking.startTime}</td>
                                <td>{booking.endTime}</td>
                                <td>{booking.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}