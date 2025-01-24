// client/src/pages/VolunteerFlow/VolunteerDashboard.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapView from "../../components/MapView";
import MatchingDashboard from "../../components/MatchingDashboard";

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
  const [displayMode, setDisplayMode] = useState("browse");
  const [orgs, setOrgs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [warning, setWarning] = useState(null);
  const [distances, setDistances] = useState({});
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    console.log('VolunteerDashboard mounted with userId:', userId);
    setDebugInfo(prev => ({ ...prev, userId }));

    if (!userId) {
      console.error('No userId available in params');
      setWarning('User ID not found. Please try logging in again.');
      setLoading(false);
      return;
    }

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          console.log('Got user location:', location);
          setUserLocation(location);
          setDebugInfo(prev => ({ ...prev, location }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setWarning("Unable to get your location. Some features may be limited.");
          const defaultLocation = { lat: 34.0522, lng: -118.2437 };
          setUserLocation(defaultLocation);
          setDebugInfo(prev => ({ ...prev, locationError: error.message, defaultLocation }));
        }
      );
    } else {
      const defaultLocation = { lat: 34.0522, lng: -118.2437 };
      setWarning("Geolocation is not supported by your browser.");
      setUserLocation(defaultLocation);
      setDebugInfo(prev => ({ ...prev, geolocationSupport: false, defaultLocation }));
    }

    // Fetch organizations
    const fetchOrgs = async () => {
      try {
        console.log('Fetching organizations...');
        const response = await fetch("http://localhost:8080/api/orgs");
        console.log('Organizations response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch organizations: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} organizations`);
        setDebugInfo(prev => ({ ...prev, orgsCount: data.length }));
        
        setOrgs(data);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setWarning("Unable to load organizations. Please try again later.");
        setDebugInfo(prev => ({ ...prev, orgsError: err.message }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [userId]);

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
        {warning && (
          <div className="p-4 mb-4 border border-yellow-400 bg-yellow-50 text-yellow-800 rounded">
            <strong>Warning:</strong> {warning}
          </div>
        )}

        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="p-4 mb-4 border border-blue-200 bg-blue-50 text-sm font-mono">
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Volunteer Dashboard
          </h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                console.log('Switching display mode from', displayMode);
                setDisplayMode(displayMode === "browse" ? "matches" : "browse");
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {displayMode === "browse" ? "View Matched Tasks" : "Browse Organizations"}
            </button>
            {displayMode === "browse" && (
              <button
                onClick={() => {
                  console.log('Switching view mode from', viewMode);
                  setViewMode(viewMode === "list" ? "map" : "list");
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Switch to {viewMode === "list" ? "Map" : "List"} View
              </button>
            )}
          </div>
        </div>

        {displayMode === "browse" ? (
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
            <MapView
              orgs={orgs}
              userLocation={userLocation}
              setView={setViewMode}
              view={viewMode}
            />
          )
        ) : (
          <div>
            {console.log('Rendering MatchingDashboard with userId:', userId)}
            <MatchingDashboard volunteerId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerDashboard;