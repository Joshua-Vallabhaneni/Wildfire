// client/src/pages/RequesterFlow/RequesterAvailability.js

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RequesterAvailability.css"; // <-- Import CSS file

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = ["6am-9am", "9am-12pm", "12pm-3pm", "3pm-6pm", "6pm-9pm"];

function RequesterAvailability() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({});

  const handleCheckboxChange = (day, slot) => {
    setAvailability((prev) => {
      const slots = prev[day] || [];
      // Add or remove slot
      return slots.includes(slot)
        ? { ...prev, [day]: slots.filter((s) => s !== slot) }
        : { ...prev, [day]: [...slots, slot] };
    });
  };

  const handleSubmit = async () => {
    // Save the requestor's availability
    await fetch(`http://localhost:8080/api/requesters/${userId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability }),
    });
    navigate(`/requester/${userId}/tasks`); // Adjust path if needed
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
