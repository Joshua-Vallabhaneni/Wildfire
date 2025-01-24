import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    // 1) Make the card start nearer to the top
    alignItems: "flex-start",
    justifyContent: "center",

    // 2) Add a bit more top padding
    padding: "4rem 2rem",
    fontFamily: '"Inter", -apple-system, sans-serif',
    background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
    color: "#1a1a1a",
    position: "relative",
    overflow: "hidden",
  },
  backgroundLayer1: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "radial-gradient(circle at 50% -20%, #FF4500, transparent)",
    opacity: 0.3,
    animation: "pulse 2s infinite",
  },
  backgroundLayer2: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
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
    maxWidth: "640px",
    boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
  },
  // ... the rest of your styles remain unchanged ...
};

function VolunteerSkills() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [skillsText, setSkillsText] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    try {
      const tasksWilling = [{ title: skillsText }];
      const response = await fetch(`http://localhost:8080/api/users/${userId}/tasksWilling`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasksWilling }),
      });
      if (!response.ok) {
        throw new Error("Failed to update tasksWilling in the database.");
      }
      navigate(`/volunteer/${userId}/dashboard`);
    } catch (error) {
      console.error("Error updating tasksWilling:", error);
      alert("Unable to save your tasks/skills. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundLayer1} />
      <div style={styles.backgroundLayer2} />

      <div style={styles.card}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem", color: "#333", textAlign: "center" }}>
          What tasks/skills are you interested in?
        </h2>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#333" }}>
            Share any skills or areas you want to help with:
          </label>
          <textarea
            style={{
              width: "100%",
              minHeight: "100px",
              borderRadius: "12px",
              border: focused ? "1px solid #FFA500" : "1px solid rgba(255,165,0,0.2)",
              boxShadow: focused ? "0 0 4px rgba(255,165,0,0.3)" : "none",
              padding: "0.75rem 1rem",
              fontSize: "0.95rem",
              resize: "vertical",
              outline: "none",
              transition: "border 0.2s, box-shadow 0.2s",
            }}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            display: "inline-block",
            padding: "14px 24px",
            borderRadius: "12px",
            border: "none",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            background: "linear-gradient(135deg, #FF4500, #FFA500)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(255, 69, 0, 0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(255, 69, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 69, 0, 0.2)";
          }}
        >
          Next: Dashboard
        </button>
      </div>
    </div>
  );
}

export default VolunteerSkills;
