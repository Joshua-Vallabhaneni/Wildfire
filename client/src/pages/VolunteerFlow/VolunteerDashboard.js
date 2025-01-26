// In VolunteerDashboard.js
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
  const [matches, setMatches] = useState(null); // Add this state
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Validate userId
    if (!userId) {
      setWarning("No user ID found in the URL.");
      setLoading(false);
      return;
    }

    // Get user's geolocation
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

    // Fetch organizations and matches
    const fetchData = async () => {
      try {
        const [orgsResponse, matchesResponse] = await Promise.all([
          fetch("http://localhost:8080/api/orgs"),
          fetch(`http://localhost:8080/api/matching/${userId}`)
        ]);

        if (!orgsResponse.ok || !matchesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const orgsData = await orgsResponse.json();
        const matchesData = await matchesResponse.json();

        setOrgs(orgsData);
        setMatches(matchesData);
      } catch (err) {
        setWarning("Error fetching organizations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: "center" }}>
        <div style={{ fontSize: "1.25rem", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <nav style={styles.navBar}>
        <div style={styles.navLinks}>
          <Link
            to={`/volunteer/${userId}/dashboard`}
            style={styles.navLinkItem}
          >
            Dashboard
          </Link>
          <Link
            to="/messages"
            state={{ userId: userId }}
            style={styles.navLinkItem}
          >
            Direct Messages
          </Link>
          <Link to="/sustainability" style={styles.navLinkItem}>
            Sustainability Tracker
          </Link>
        </div>
        {/* Button to switch between tasks/map */}
        <button
          onClick={() =>
            setCurrentView(currentView === "tasks" ? "map" : "tasks")
          }
          style={styles.switchButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.switchButtonHover.transform;
            e.currentTarget.style.boxShadow = styles.switchButtonHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = styles.switchButton.boxShadow;
          }}
        >
          {currentView === "tasks" ? "Switch to Map View" : "Switch to Tasks"}
        </button>
      </nav>

      {/* Warning banner if geolocation or fetch failed */}
      {warning && (
        <div style={styles.warningBanner}>
          <strong>Warning:</strong> {warning}
        </div>
      )}

      {/* Main Content: tasks or map */}
      <div style={styles.contentWrapper}>
        {currentView === "tasks" ? (
          <MatchingDashboard volunteerId={userId} />
        ) : (
          <MapView orgs={orgs} requestorTasks={matches?.requestorTasks || []} userLocation={userLocation} />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#FFA500",
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    fontFamily: '"Inter", -apple-system, sans-serif',
    color: "#1a1a1a",
  },
  navBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
  },
  navLinks: {
    display: "flex",
    gap: "2rem",
  },
  navLinkItem: {
    fontSize: "1.1rem",
    fontWeight: 600,
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "#000",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
  switchButton: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #0099CC, #66CCFF)",
    border: "none",
    borderRadius: "999px",
    padding: "0.75rem 1.5rem",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 153, 204, 0.3)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  switchButtonHover: {
    transform: "translateY(-2px) scale(1.05)",
    boxShadow: "0 8px 24px rgba(0, 153, 204, 0.4)",
  },
  warningBanner: {
    margin: "1rem auto",
    padding: "0.75rem 1rem",
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
};

export default VolunteerDashboard;