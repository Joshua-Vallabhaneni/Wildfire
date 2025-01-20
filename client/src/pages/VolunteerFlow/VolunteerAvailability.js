// client/src/pages/VolunteerFlow/VolunteerAvailability.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const timeSlots = ["6am-9am","9am-12pm","12pm-3pm","3pm-6pm","6pm-9pm"];

function VolunteerAvailability() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({});

  const handleCheckboxChange = (day, slot) => {
    setAvailability((prev) => {
      const slots = prev[day] || [];
      if (slots.includes(slot)) {
        return { ...prev, [day]: slots.filter(s => s !== slot) };
      } else {
        return { ...prev, [day]: [...slots, slot] };
      }
    });
  };

  const handleSubmit = async () => {
    await fetch(`http://localhost:8080/api/users/${userId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability })
    });
    navigate(`/volunteer/${userId}/skills`);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Select Your Availability</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Time Slots</th>
            {days.map((d) => <th key={d}>{d}</th>)}
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

      <button onClick={handleSubmit}>Next: Skills</button>
    </div>
  );
}

export default VolunteerAvailability;
