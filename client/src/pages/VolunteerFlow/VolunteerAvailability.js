import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Days and time slots
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = ["6am-9am", "9am-12pm", "12pm-3pm", "3pm-6pm", "6pm-9pm"];

/**
 * Inline styles to match the modern, orange-themed design.
 */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
    padding: "2rem",
    fontFamily: '"Inter", -apple-system, sans-serif',
    color: "#1a1a1a",
    position: "relative",
    overflow: "hidden",
  },
  backgroundLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 50% -20%, #FF4500, transparent)",
    opacity: 0.3,
    animation: "pulse 2s infinite",
  },
  backgroundLayer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 30% 100%, #FFA500, transparent)",
    opacity: 0.2,
  },
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    padding: "2rem",
    border: "1px solid rgba(255, 165, 0, 0.2)",
    width: "100%",
    maxWidth: "740px",
    boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#333",
  },
  tableWrapper: {
    overflowX: "auto", // in case of narrower screens
    marginBottom: "1.5rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },
  th: {
    backgroundColor: "#fafafa",
    fontWeight: 600,
    color: "#555",
    border: "1px solid #ddd",
    padding: "0.75rem",
    textAlign: "center",
  },
  td: {
    border: "1px solid #ddd",
    padding: "0.75rem",
    textAlign: "center",
    fontSize: "0.95rem",
  },
  checkbox: {
    transform: "scale(1.2)",
    cursor: "pointer",
  },
  button: {
    display: "inline-block",
    padding: "16px 24px",
    borderRadius: "12px",
    border: "none",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg, #FF4500, #FFA500)",
    color: "#fff",
    boxShadow: "0 4px 20px rgba(255, 69, 0, 0.2)",
    marginTop: "1.5rem",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    textAlign: "center",
  },
  buttonHover: {
    transform: "translateY(-2px) scale(1.02)",
    boxShadow: "0 6px 24px rgba(255, 69, 0, 0.3)",
  },
};

function VolunteerAvailability() {
  const { userId } = useParams();
  const navigate = useNavigate();
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
    await fetch(`http://localhost:8080/api/users/${userId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability }),
    });
    navigate(`/volunteer/${userId}/skills`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundLayer1} />
      <div style={styles.backgroundLayer2} />

      <div style={styles.card}>
        <h2 style={styles.title}>Select Your Availability</h2>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Time Slots</th>
                {days.map((day) => (
                  <th style={styles.th} key={day}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td style={styles.td}>{slot}</td>
                  {days.map((day) => (
                    <td style={styles.td} key={day}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={availability[day]?.includes(slot) || false}
                        onChange={() => handleCheckboxChange(day, slot)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.buttonHover.transform;
            e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = styles.button.boxShadow;
          }}
          onClick={handleSubmit}
        >
          Next: Skills
        </button>
      </div>
    </div>
  );
}

export default VolunteerAvailability;
