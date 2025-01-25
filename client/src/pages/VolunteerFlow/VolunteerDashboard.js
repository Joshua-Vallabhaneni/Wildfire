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
    if (!userId) {
      setWarning("No user ID found in the URL.");
      setLoading(false);
      return;
    }

    // Attempt to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setWarning("Couldn't get location. Using default LA coords.");
          setUserLocation({ lat: 34.0522, lng: -118.2437 });
        }
      );
    } else {
      setWarning("Geolocation not supported. Using default LA coords.");
      setUserLocation({ lat: 34.0522, lng: -118.2437 });
    }

    // We'll also fetch /api/orgs for the map. 
    // (But note: the actual "always visible" org tasks are fetched in MatchingDashboard)
    const fetchOrgs = async () => {
      try {
        const resp = await fetch("http://localhost:8080/api/orgs");
        if (!resp.ok) {
          throw new Error(`Failed to fetch orgs. Status: ${resp.status}`);
        }
        const data = await resp.json();
        setOrgs(data);
      } catch (err) {
        setWarning(`Error fetching organizations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [userId]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* The black nav bar + switch button */}
      <nav style={styles.navBar}>
        <div style={styles.navLinks}>
          <Link to={`/volunteer/${userId}/dashboard`} style={styles.navLinkItem}>
            Dashboard
          </Link>
          <Link to="/messages" state={{ userId }} style={styles.navLinkItem}>
            Direct Messages
          </Link>
          <Link to="/sustainability" style={styles.navLinkItem}>
            Sustainability Tracker
          </Link>
        </div>
        <button
          style={styles.switchButton}
          onClick={() => setCurrentView(currentView === "tasks" ? "map" : "tasks")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,153,204,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,153,204,0.3)";
          }}
        >
          {currentView === "tasks" ? "Switch to Map View" : "Switch to Tasks"}
        </button>
      </nav>

      {warning && (
        <div style={styles.warningBanner}>
          <strong>Warning:</strong> {warning}
        </div>
      )}

      <div style={styles.contentWrapper}>
        {currentView === "tasks" ? (
          <MatchingDashboard volunteerId={userId} />
        ) : (
          <MapView orgs={orgs} userLocation={userLocation} />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#FFA500",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
  },
  navLinks: {
    display: "flex",
    gap: "1rem",
  },
  navLinkItem: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 600,
  },
  switchButton: {
    background: "linear-gradient(135deg, #0099CC, #66CCFF)",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "0.75rem 1.5rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,153,204,0.3)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  warningBanner: {
    margin: "0.5rem auto",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    maxWidth: "600px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeeba",
    color: "#856404",
    fontSize: "1rem",
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "2rem",
  },
  loadingText: {
    fontSize: "1.25rem",
    color: "#666",
    margin: "auto",
  },
};

export default VolunteerDashboard;
