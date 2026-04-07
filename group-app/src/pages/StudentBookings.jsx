import {useEffect, useState} from "react";
import {cancelBooking,getStudentBookings} from "../api/bookingAPI";
import MessagingPage from "./MessagingPage";

function ErrorModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Something went wrong</h3>
        <p style={styles.message}>{message}</p>
        <button style={styles.button} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function StudentBookings({studentId}){
    const[bookings,setBookings]=useState([]);
    const [errorMessage, setErrorMessage]=useState("");
    const [activeChat, setActiveChat]=useState(null);

    const loadBookings = async () =>{
        try{
            const response = await getStudentBookings(studentId);
            setBookings(response.data);
        } catch (error){
            console.error("Error loading bookings",error);
            console.error("Response data: ",error.response?.data);
            setErrorMessage("Unable to load bookings right now.");
        }
        };

        useEffect(() =>{
            if(studentId){
            loadBookings();
        }
        },[studentId]);

        const handleCancel = async (id)=>{
            try{
                await cancelBooking(id);
                loadBookings();

            }catch(error){
                console.error("Error cancelling booking", error);
                setErrorMessage("Failed to cancel booking. Please try again.")
            }
        };

        return (
            <div>
                <h2>My Bookings</h2>

                <ErrorModal
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

                {bookings.length ===0? (
                    <p>No bookings found.</p>
                ):(
                    bookings.map((booking)=>(
                        <div key={booking.id}>
                            <p><strong>Skill:</strong>{booking.skill}</p>
                            <p><strong>Date:</strong> {booking.sessionDate}</p>
                            <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                            {(booking.status==="PENDING"||booking.status==="APPROVED"||booking.status==="CONFIRMED")&&(
                                <button onClick={()=>handleCancel(booking.id)}>Cancel</button>
                            )}
                            {booking.status==="CONFIRMED"&&(
                                <button
                                    onClick={()=>setActiveChat(activeChat?.id===booking.id ? null : booking)}
                                    style={{marginLeft:"10px"}}
                                >
                                    {activeChat?.id===booking.id ? "Close Chat" : "Message Tutor"}
                                </button>
                            )}
                            {activeChat?.id===booking.id&&(
                                <MessagingPage booking={booking} currentUserId={studentId} />
                            )}
                            <hr />
                        </div>
                    ))
                )}
            </div>
        );
    }

    const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: "12px",
    color: "#d32f2f",
  },
  message: {
    marginBottom: "20px",
    color: "#333",
  },
  button: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
  },
};