// In VolunteerDashboard.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MatchingDashboard from "../../components/MatchingDashboard";
import MapView from "../../components/MapView";
import NavBar from "../../components/NavBar";

function VolunteerDashboard() {
  const { userId } = useParams();
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("tasks"); // "tasks" or "map"
  const [orgs, setOrgs] = useState([]);
  const [matches, setMatches] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
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
      <div style={styles.container}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <NavBar userId={userId} />

      {warning && (
        <div style={styles.warningBanner}>
          <strong>Warning:</strong> {warning}
        </div>
      )}

      <button
        onClick={() => setCurrentView(currentView === "tasks" ? "map" : "tasks")}
        style={styles.switchButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
        }}
      >
        Switch to {currentView === "tasks" ? "Map" : "Tasks"} View
      </button>

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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
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
  viewToggle: {
    position: "absolute",
    top: "1rem",
    right: "2rem",
    zIndex: 2,
  },
  switchButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#fff",
    background: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    zIndex: 10,
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255, 165, 0, 0.3)',
    borderTop: '6px solid #FF4500',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }
};

export default VolunteerDashboard;