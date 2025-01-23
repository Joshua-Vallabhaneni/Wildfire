// client/src/pages/RequesterFlow/RequesterBackgroundCheck.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RequesterBackgroundCheck() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    // Simulate background check with SerpAPI
    // We'll just do a setTimeout for demonstration
    const timer = setTimeout(() => {
      setStatus("Approved");
      // In a real app, you'd call your backend which calls SerpAPI:
      // fetch(`http://localhost:8080/api/users/${userId}/runBackgroundCheck`, { ... })
    }, 3000);

    return () => clearTimeout(timer);
  }, [userId]);

  const proceed = () => {
    // After background check, go to availability
    navigate(`/requester/${userId}/availability`);
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

export default RequesterBackgroundCheck;
