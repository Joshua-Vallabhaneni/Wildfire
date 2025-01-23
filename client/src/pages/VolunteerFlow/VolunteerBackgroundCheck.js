// client/src/pages/VolunteerFlow/VolunteerBackgroundCheck.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VolunteerBackgroundCheck() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("Approved");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const proceed = () => {
    navigate(`/volunteer/${userId}/availability`);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Background Check Undergoing</h2>
      <p>Status: {status}</p>
      {status === "Approved" && (
        <button onClick={proceed}>Proceed to Availability</button>
      )}
    </div>
  );
}

export default VolunteerBackgroundCheck;
