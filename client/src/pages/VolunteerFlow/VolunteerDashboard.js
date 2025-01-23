// client/src/pages/VolunteerFlow/VolunteerDashboard.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapView from "../../components/MapView";
import MatchingDashboard from "../../components/MatchingDashboard";

// Organization Card Component
const OrgCard = ({ org, userLocation, distance }) => {
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
          {!org.address.toLowerCase().includes('virtual') && 
           !org.address.toLowerCase().includes('nationwide') && 
           distance && (
            <p className="text-sm text-gray-500 mt-1">{distance} miles away</p>
          )}
        </div>
        <span className="text-orange-500">
          {expanded ? "▼" : "▶"}
        </span>
      </div>

      {expanded && (
        <div className="mt-4">
          <div className="mb-2">
            <span className="font-semibold">Urgency Level:</span>{" "}
            <span className={`text-${org.urgencyLevel > 7 ? 'red' : 'orange'}-500`}>
              {org.urgencyLevel}/10
            </span>
          </div>
          
          <div className="mb-2">
            <span className="font-semibold">Specialty Required:</span>{" "}
            {org.specialtyRequired ? "Yes" : "No"}
          </div>
          
          <div className="mb-2">
            <span className="font-semibold">Tasks:</span>
            <ul className="list-disc ml-6 mt-1">
              {org.tasksRequested.map((task, index) => (
                <li key={index} className="text-sm">
                  {task.title}
                  <span className="text-gray-500"> - Urgency: {task.urgency}/10</span>
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

// Main VolunteerDashboard Component
function VolunteerDashboard() {
  const { userId } = useParams();
  const [viewMode, setViewMode] = useState("list");
  const [displayMode, setDisplayMode] = useState("browse"); // "browse" or "matches"
  const [orgs, setOrgs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [distances, setDistances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user's geolocation
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
          setError("Unable to get your location. Some features may be limited.");
        }
      );
    }

    // Fetch organizations
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/orgs");
        if (!response.ok) throw new Error("Failed to fetch organizations");
        const data = await response.json();
        
        setOrgs(data);
        
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Unable to load organizations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [userId]);

  // Calculate distances when userLocation and orgs are available
  useEffect(() => {
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
    };

    const geocodeAndCalculateDistances = async () => {
      if (!userLocation || !orgs.length) return;

      try {
        const updatedDistances = {};
        
        await Promise.all(orgs.map(async (org) => {
          try {
            const encodedAddress = encodeURIComponent(org.address);
            const response = await fetch(
              `https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf62487b6a99d2d000446a95d1308087fb1056&text=${encodedAddress}`
            );
            const data = await response.json();
            
            if (data.features && data.features[0]) {
              const [lng, lat] = data.features[0].geometry.coordinates;
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                lat,
                lng
              );
              updatedDistances[org._id] = distance;
            }
          } catch (error) {
            console.error('Geocoding error for org:', org.name, error);
          }
        }));

        setDistances(updatedDistances);
      } catch (error) {
        console.error('Error calculating distances:', error);
      }
    };

    geocodeAndCalculateDistances();
  }, [userLocation, orgs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Volunteer Dashboard
          </h2>
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
                      userLocation={userLocation}
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
                      userLocation={userLocation}
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
          <MatchingDashboard volunteerId={userId} />
        )}
      </div>
    </div>
  );
}

export default VolunteerDashboard;