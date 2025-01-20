// client/src/pages/VolunteerFlow/VolunteerDashboard.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapView from "../../components/MapView";

function VolunteerDashboard() {
  const { userId } = useParams();
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

  const [orgs, setOrgs] = useState([]);
  const [tasks, setTasks] = useState([]); // Community tasks
  // We might fetch user location with geolocation as well
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }

    // Fetch organizations
    fetch("http://localhost:8080/api/orgs")
      .then(res => res.json())
      .then(data => setOrgs(data))
      .catch(err => console.error(err));

    // Fetch tasks
    fetch("http://localhost:8080/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err));
  }, []);

  const toggleView = () => {
    setViewMode(viewMode === "list" ? "map" : "list");
  };

  const handleDM = (requesterId) => {
    // In a real app, you'd create a new conversation or open it
    // For now, just alert or navigate
    alert(`Start DM with Requester ID = ${requesterId}`);
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
            .filter((o) => /* maybe some logic to filter private vs government? For now, random */ !o.name.toLowerCase().includes("fire"))
            .map((org, i) => (
              <OrgCard key={i} org={org} />
            ))}

          <h3>Government Organizations</h3>
          {orgs
            .filter((o) => o.name.toLowerCase().includes("fire"))
            .map((org, i) => (
              <OrgCard key={i} org={org} />
            ))}

          <h3>Community Member Opportunities</h3>
          {tasks.map((task, i) => (
            <TaskCard key={i} task={task} onDM={handleDM} />
          ))}
        </div>
      ) : (
        <MapView tasks={tasks} orgs={orgs} userLocation={userLocation} />
      )}
    </div>
  );
}

// Minimal card components:
function OrgCard({ org }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
      <div onClick={() => setExpanded(!expanded)}>
        <b>{org.name}</b> - {org.address} <br/>
        <a href={org.link} target="_blank" rel="noreferrer">Link</a>
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

function TaskCard({ task, onDM }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }} onClick={() => setExpanded(!expanded)}>
        <div>
          <b>Requester:</b> {task.requesterId ? task.requesterId : "Community Member"} <br/>
          <b>Task:</b> {task.title}
          {/* Distance might be shown here if pre-calculated */}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDM(task.requesterId); }}>DM</button>
      </div>
      {expanded && (
        <div style={{ marginTop: "5px" }}>
          <p>Urgency: {task.urgency}</p>
          <p>Specialty Required: {task.specialtyRequired ? "Yes" : "No"}</p>
          <p>Task Type: {task.category}</p>
        </div>
      )}
    </div>
  );
}

export default VolunteerDashboard;
