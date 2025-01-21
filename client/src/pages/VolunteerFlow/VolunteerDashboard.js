// client/src/pages/VolunteerFlow/VolunteerDashboard.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapView from "../../components/MapView";

function VolunteerDashboard() {
  const { userId } = useParams();
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const [orgs, setOrgs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Attempt to get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }

    // Fetch organizations from /api/orgs
    fetch("http://localhost:8080/api/orgs")
      .then((res) => res.json())
      .then((data) => setOrgs(data))
      .catch((err) => console.error("Error fetching orgs:", err));
  }, [userId]);

  const toggleView = () => {
    setViewMode(viewMode === "list" ? "map" : "list");
  };

  // Example DM stub
  const handleDM = (someId) => {
    alert(`Start DM with user or requester ID = ${someId}`);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Volunteer Dashboard</h2>
      <button onClick={toggleView}>
        Switch to {viewMode === "list" ? "Map" : "List"} View
      </button>

      {viewMode === "list" ? (
        <div>
          <h3>Private Organizations</h3>
          {orgs
            .filter((o) => !o.name.toLowerCase().includes("fire"))
            .map((org, i) => (
              <OrgCard key={i} org={org} />
            ))}

          <h3>Government Organizations</h3>
          {orgs
            .filter((o) => o.name.toLowerCase().includes("fire"))
            .map((org, i) => (
              <OrgCard key={i} org={org} />
            ))}

          {/* Any additional listings or logic can go here */}
        </div>
      ) : (
        <MapView orgs={orgs} userLocation={userLocation} />
      )}
    </div>
  );
}

// Minimal organization card component
function OrgCard({ org }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        margin: "5px",
        padding: "5px",
        cursor: "pointer",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div>
        <b>{org.name}</b> - {org.address} <br />
        <a href={org.link} target="_blank" rel="noreferrer">
          Link
        </a>
      </div>

      {expanded && (
        <div style={{ marginTop: "5px" }}>
          <p>Urgency Level: {org.urgencyLevel}</p>
          <p>Specialty Required: {org.specialtyRequired ? "Yes" : "No"}</p>
          <p>Task Type: {org.taskType}</p>
        </div>
      )}
    </div>
  );
}

export default VolunteerDashboard;
