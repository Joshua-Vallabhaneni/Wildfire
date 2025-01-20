// client/src/pages/RequesterFlow/RequesterDashboard.js
import React from "react";
import { Link, useParams } from "react-router-dom";

function RequesterDashboard() {
  const { userId } = useParams();

  return (
    <div style={{ padding: "10px" }}>
      <h2>Requester Dashboard</h2>
      <p>Welcome, your tasks are being matched with volunteers.</p>
      <Link to="/messages">Go to Direct Messages</Link>
    </div>
  );
}

export default RequesterDashboard;
