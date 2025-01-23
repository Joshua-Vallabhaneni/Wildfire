import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./VolunteerAvailability.css"; // <-- Import the CSS

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const timeSlots = ["6am-9am","9am-12pm","12pm-3pm","3pm-6pm","6pm-9pm"];

function VolunteerAvailability() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({});

  const handleCheckboxChange = (day, slot) => {
    setAvailability(prev => {
      const slotsForDay = prev[day] || [];
      if (slotsForDay.includes(slot)) {
        // Remove the slot
        return {
          ...prev,
          [day]: slotsForDay.filter(s => s !== slot),
        };
      } else {
        // Add the slot
        return {
          ...prev,
          [day]: [...slotsForDay, slot],
        };
      }
    });
  };

  const handleSubmit = async () => {
    await fetch(`http://localhost:8080/api/users/${userId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability }),
    });
    navigate(`/volunteer/${userId}/skills`);
  };

  return (
    <div className="availability-container">
      <h2 className="availability-title">Select Your Availability</h2>
      <table className="availability-table">
        <thead>
          <tr>
            <th>Time Slots</th>
            {days.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(slot => (
            <tr key={slot}>
              <td>{slot}</td>
              {days.map(day => (
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
        Next: Skills
      </button>
    </div>
  );
}

export default VolunteerAvailability;
