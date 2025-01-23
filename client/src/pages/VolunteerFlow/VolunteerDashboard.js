// client/src/pages/VolunteerFlow/VolunteerDashboard.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapView from "../../components/MapView";
import MatchingDashboard from "../../components/MatchingDashboard";

/**
 * Simple card to show org details in a list (when not in map view).
 */
const OrgCard = ({ org, distance }) => {
  const [expanded, setExpanded] = useState(false);

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    margin: "0.5rem 0",
    padding: "1rem",
    backgroundColor: "white",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
  };

  return (
    <div
      style={cardStyle}
      onClick={() => setExpanded(!expanded)}
      className="hover:shadow-md"
    >
      <div style={headerStyle}>
        <div>
          <h3 className="font-bold text-lg">{org.name}</h3>
          <p className="text-sm text-gray-600">{org.address}</p>
          {distance && (
            <p className="text-sm text-gray-500 mt-1">{distance} miles away</p>
          )}
        </div>
        <span className="text-orange-500">{expanded ? "▼" : "▶"}</span>
      </div>

      {expanded && (
        <div className="mt-4">
          <div className="mb-2">
            <strong>Urgency Level:</strong>{" "}
            <span style={{ color: org.urgencyLevel > 7 ? "red" : "orange" }}>
              {org.urgencyLevel}/10
            </span>
          </div>

          <div className="mb-2">
            <strong>Specialty Required:</strong>{" "}
            {org.specialtyRequired ? "Yes" : "No"}
          </div>

          <div className="mb-2">
            <strong>Tasks:</strong>
            <ul className="list-disc ml-6 mt-1">
              {org.tasksRequested.map((task, index) => (
                <li key={index} className="text-sm">
                  {task.title} – Urgency: {task.urgency}/10
                </li>
              ))}
            </ul>
          </div>

          {org.link && (
            <div className="mt-3">
              <a
                href={org.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Website →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function VolunteerDashboard() {
  const { userId } = useParams();
  const [viewMode, setViewMode] = useState("list");
  const [displayMode, setDisplayMode] = useState("browse"); // 'browse' or 'matches'
  const [orgs, setOrgs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // Instead of stopping the entire UI, store a small message:
  const [warning, setWarning] = useState(null);

  const [distances, setDistances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Instead of blocking the UI, just show a warning & set fallback:
          setWarning("Unable to get your location. Some features may be limited.");
          setUserLocation({
            lat: 34.0522, // Fallback: Los Angeles coords
            lng: -118.2437,
          });
        }
      );
    } else {
      setWarning("Geolocation is not supported by your browser.");
      // Also use fallback:
      setUserLocation({ lat: 34.0522, lng: -118.2437 });
    }

    // 2) Fetch organizations from the server
    const fetchOrgs = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/orgs");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        setOrgs(data);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setWarning("Unable to load organizations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [userId]);

  // Removed any "if (warning) return" because we want the UI to show anyway

  // 3) Once userLocation & orgs are available, distances are calculated in MapView directly.
  //    Or you can do it here in a second useEffect if you prefer.

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 max-w-4xl mx-auto">
        {/* If there's a warning, show it up top but don't block the rest */}
        {warning && (
          <div className="p-4 mb-4 border border-yellow-400 bg-yellow-50 text-yellow-800 rounded">
            <strong>Warning:</strong> {warning}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Volunteer Dashboard</h2>
          <div className="space-x-4">
            <button
              onClick={() => setDisplayMode(displayMode === "browse" ? "matches" : "browse")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {displayMode === "browse" ? "View Matched Tasks" : "Browse Organizations"}
            </button>
            {displayMode === "browse" && (
              <button
                onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Switch to {viewMode === "list" ? "Map" : "List"} View
              </button>
            )}
          </div>
        </div>

        {displayMode === "browse" ? (
          // BROWSE MODE: Show orgs in "list" or "map" view
          viewMode === "list" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700">
                  Private Organizations
                </h3>
                {orgs
                  .filter((o) => !o.name.toLowerCase().includes("fire"))
                  .map((org) => (
                    <OrgCard
                      key={org._id}
                      org={org}
                      distance={distances[org._id]}
                    />
                  ))}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700">
                  Government Organizations
                </h3>
                {orgs
                  .filter((o) => o.name.toLowerCase().includes("fire"))
                  .map((org) => (
                    <OrgCard
                      key={org._id}
                      org={org}
                      distance={distances[org._id]}
                    />
                  ))}
              </div>
            </div>
          ) : (
            // Map View
            <MapView
              orgs={orgs}
              userLocation={userLocation}
              setView={setViewMode}
              view={viewMode}
            />
          )
        ) : (
          // MATCHES MODE: show the user's matched tasks (Deep Seek code is in /api/matching)
          <MatchingDashboard volunteerId={userId} />
        )}
      </div>
    </div>
  );
}

export default VolunteerDashboard;
