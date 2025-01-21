// client/src/pages/VolunteerFlow/VolunteerSkills.js

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VolunteerSkills() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // A single text field for volunteer's tasks/skills
  const [skillsText, setSkillsText] = useState("");

  const handleSubmit = async () => {
    try {
      // We'll place the entire text in a single { title: "" } object
      const tasksWilling = [
        { title: skillsText }
      ];

      // PUT request to append the volunteer's tasks/skills
      const response = await fetch(`http://localhost:8080/api/users/${userId}/tasksWilling`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasksWilling })
      });

      if (!response.ok) {
        throw new Error("Failed to update tasksWilling in the database.");
      }

      // Navigate to next step: background check
      navigate(`/volunteer/${userId}/background-check`);
    } catch (error) {
      console.error("Error updating tasksWilling:", error);
      alert("Unable to save your tasks/skills. Please try again.");
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>What tasks/skills are you interested in?</h2>
      <textarea
        rows="5"
        cols="50"
        value={skillsText}
        onChange={(e) => setSkillsText(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit}>Next: Background Check</button>
    </div>
  );
}

export default VolunteerSkills;
