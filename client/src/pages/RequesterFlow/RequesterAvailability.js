// client/src/pages/RequesterFlow/RequesterAvailability.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RequesterAvailability.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = ["6am-9am", "9am-12pm", "12pm-3pm", "3pm-6pm", "6pm-9pm"];

function RequesterAvailability() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // local state to track which slots each day has
  const [availability, setAvailability] = useState({});

  const handleCheckboxChange = (day, slot) => {
    setAvailability((prev) => {
      const slotsForDay = prev[day] || [];
      if (slotsForDay.includes(slot)) {
        // remove the slot
        return {
          ...prev,
          [day]: slotsForDay.filter((s) => s !== slot),
        };
      } else {
        // add the slot
        return {
          ...prev,
          [day]: [...slotsForDay, slot],
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });

      if (!response.ok) {
        throw new Error("Failed to update requester's availability in the database.");
      }

      // after success, navigate to the next step
      navigate(`/requester/${userId}/tasks`);
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Error updating availability. Please try again.");
    }
  };

  return (
    <div className="availability-container">
      <h2 className="availability-title">Set Your Request Availability</h2>

      <table className="availability-table">
        <thead>
          <tr>
            <th>Time Slots</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot}>
              <td>{slot}</td>
              {days.map((day) => (
                <td key={day}>
                  <input
                    type="checkbox"
                    checked={availability[day]?.includes(slot) || false}
                    onChange={() => handleCheckboxChange(day, slot)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleSubmit} className="availability-button">
        Confirm Availability
      </button>
    </div>
  );
}

export default RequesterAvailability;
