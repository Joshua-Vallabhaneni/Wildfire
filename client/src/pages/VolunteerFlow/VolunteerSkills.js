// client/src/pages/VolunteerFlow/VolunteerSkills.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VolunteerSkills() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [skills, setSkills] = useState("");

  const handleSubmit = async () => {
    await fetch(`http://localhost:8080/api/users/${userId}/volunteerInterests`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volunteerInterests: skills })
    });
    navigate(`/volunteer/${userId}/background-check`);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>What tasks/skills are you interested in?</h2>
      <textarea
        rows="5"
        cols="50"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />
      <br/>
      <button onClick={handleSubmit}>Next: Background Check</button>
    </div>
  );
}

export default VolunteerSkills;
