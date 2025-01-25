// client/src/pages/VolunteerFlow/VolunteerDashboard.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MatchingDashboard from "../../components/MatchingDashboard";
import MapView from "../../components/MapView";

function VolunteerDashboard() {
  const { userId } = useParams();
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("tasks"); // "tasks" or "map"
  const [orgs, setOrgs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Validate userId
    if (!userId) {
      setWarning("No user ID found in the URL.");
      setLoading(false);
      return;
    }

    // Attempt to get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setWarning("Couldn't get location. Using default Los Angeles coords.");
          setUserLocation({ lat: 34.0522, lng: -118.2437 });
        }
      );
    } else {
      setWarning("Geolocation not supported. Using default Los Angeles coords.");
      setUserLocation({ lat: 34.0522, lng: -118.2437 });
    }

    // Fetch organizations (for map markers)
    const fetchOrgs = async () => {
      try {
        const resp = await fetch("http://localhost:8080/api/orgs");
        if (!resp.ok) {
          throw new Error(`Failed to fetch orgs: status ${resp.status}`);
        }
        const data = await resp.json();
        setOrgs(data);
      } catch (err) {
        setWarning("Error fetching organizations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <nav className="bg-white shadow p-4 mb-4">
        <ul className="flex space-x-6">
          <li>
            <Link
              to={`/volunteer/${userId}/dashboard`}
              className="text-blue-600 hover:underline"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/messages"
              state={{ userId: userId }}
              className="text-blue-600 hover:underline"
            >
              Direct Messages
            </Link>
          </li>
          <li>
            <Link
              to="/sustainability"
              className="text-blue-600 hover:underline"
            >
              Sustainability Tracker
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Warning banner if geolocation or fetch failed */}
        {warning && (
          <div className="p-4 mb-4 border border-yellow-400 bg-yellow-50 text-yellow-800 rounded">
            <strong>Warning:</strong> {warning}
          </div>
        )}

        {/* Header row + toggle button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Volunteer Dashboard</h2>
          <button
            onClick={() => setCurrentView(currentView === "tasks" ? "map" : "tasks")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Switch to {currentView === "tasks" ? "Map" : "Tasks"} View
          </button>
        </div>

        {/* Main content: either the matched tasks or the map */}
        {currentView === "tasks" ? (
          <MatchingDashboard volunteerId={userId} />
        ) : (
          <MapView orgs={orgs} userLocation={userLocation} />
        )}
      </div>
    </div>
  );
}

export default VolunteerDashboard;