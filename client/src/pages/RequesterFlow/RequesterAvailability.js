// client/src/pages/RequesterFlow/RequesterAvailability.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const timeSlots = ["6am-9am","9am-12pm","12pm-3pm","3pm-6pm","6pm-9pm"];

function RequesterAvailability() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // We'll store availability in an object:
  // { Monday: ["6am-9am", "9am-12pm"], Tuesday: [...], ... }
  const [availability, setAvailability] = useState({});

  const handleCheckboxChange = (day, slot) => {
    setAvailability((prev) => {
      const slotsForDay = prev[day] || [];
      if (slotsForDay.includes(slot)) {
        // remove the slot
        return {
          ...prev,
          [day]: slotsForDay.filter((s) => s !== slot)
        };
      } else {
        // add the slot
        return {
          ...prev,
          [day]: [...slotsForDay, slot]
        };
      }
    });
  };

  const handleSubmit = async () => {
    // Send to server
    await fetch(`http://localhost:8080/api/users/${userId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability })
    });
    // Move to next step
    navigate(`/requester/${userId}/tasks`);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Step 2: Select Availability</h2>
      <table border="1" style={{ borderCollapse: "collapse" }}>
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

      <button onClick={handleSubmit} style={{ marginTop: "20px" }}>
        Next: Add Tasks
      </button>
    </div>
  );
}

export default RequesterAvailability;
