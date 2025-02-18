// src/pages/SustainabilityTracker.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import NavBar from "../../components/NavBar"; // Correct Import Path

const categories = {
  Sustainability: "Environmental recovery and conservation efforts",
  Infrastructure: "Rebuilding essential community structures",
  "Safety and Prevention": "Implementation of safety measures and prevention strategies",
  "Emergency Response": "Immediate response and relief efforts"
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column", // Ensure column layout
    alignItems: "center", // Center content horizontally
    padding: "4rem 2rem",
    fontFamily: '"Inter", -apple-system, sans-serif',
    background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
    color: "#1a1a1a",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  backgroundLayer1: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "radial-gradient(circle at 50% -20%, #FF4500, transparent)",
    opacity: 0.3,
    animation: "pulse 2s infinite",
  },
  backgroundLayer2: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "radial-gradient(circle at 30% 100%, #FFA500, transparent)",
    opacity: 0.2,
  },
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    padding: "3rem",
    border: "1px solid rgba(255, 165, 0, 0.2)",
    width: "100%",
    maxWidth: "800px",
    margin: "2rem auto 0", // Added top margin for spacing below NavBar
    boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    marginBottom: "2rem",
    textAlign: "center",
    background: "linear-gradient(135deg, #FF4500, #FFA500)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.02em",
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "2rem",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
    border: "1px solid rgba(255, 165, 0, 0.1)",
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  metricTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#333",
  },
  metricCount: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#FF4500",
    textAlign: "right",
  },
  description: {
    color: "#666",
    fontSize: "0.95rem",
    marginBottom: "1rem",
  },
  progressBar: {
    height: "8px",
    backgroundColor: "#FFE5D6",
    borderRadius: "4px",
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #FF4500, #FFA500)",
    borderRadius: "4px",
    transition: "width 1s ease-in-out",
  },
  spinner: { // Spinner styles
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255, 165, 0, 0.3)',
    borderTop: '6px solid #FF4500',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};

// ProgressMeter Component
const ProgressMeter = ({ count, maxWidth = 100 }) => (
  <div style={styles.progressBar}>
    <div 
      style={{
        ...styles.progressFill,
        width: `${Math.min(count * 10, maxWidth)}%`
      }}
    />
  </div>
);

const SustainabilityTracker = () => {
  const { userId } = useParams(); // Get userId from URL params
  const [completedTasks, setCompletedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.justCompleted) {
      fetchData();
      // Navigate to remove the `justCompleted` state
      navigate(`/volunteer/${userId}/sustainability`, { replace: true });
    }
  }, [location.state?.justCompleted, navigate, userId]);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/completed-tasks');
      const completedData = await response.json();

      // Count completed tasks by category
      const categoryCount = completedData.reduce((acc, task) => {
        const category = task.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      setCompletedTasks(categoryCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        ...styles.container, 
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)" // Consistent background
      }}>
        <div style={styles.spinner}></div> {/* Centered Spinner */}
      </div>
    );
  }

  // Calculate total completed tasks if needed
  const totalCompleted = Object.values(completedTasks).reduce((sum, count) => sum + count, 0);

  // Define hardcoded counts for category cards
  const hardcodedCounts = [5, 8, 7, 11];

  return (
    <div style={styles.container}>
      <NavBar userId={userId} /> {/* Include NavBar */}
      
      <div style={styles.backgroundLayer1} />
      <div style={styles.backgroundLayer2} />
      
      <div style={styles.card}>
        <h1 style={styles.title}>Impact Tracker</h1>

        {/* Total Completed Tasks Card */}
        <div style={{
          ...styles.metricCard,
          background: "linear-gradient(135deg, rgba(255,69,0,0.1), rgba(255,165,0,0.1))"
        }}>
          <div style={styles.metricHeader}>
            <h2 style={{...styles.metricTitle, color: "#FF4500"}}>Total Impact</h2>
            <div style={styles.metricCount}>{totalCompleted}</div>
          </div>
          <p style={styles.description}>Total tasks completed across all categories</p>
          <ProgressMeter count={totalCompleted} />
        </div>

        {/* Category Cards */}
        {Object.entries(categories).map(([category, description], index) => {
          // Assign hardcoded counts based on index
          const count = hardcodedCounts[index] || 0;

          return (
            <div 
              key={category} 
              style={styles.metricCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
            >
              <div style={styles.metricHeader}>
                <h2 style={styles.metricTitle}>{category}</h2>
                <div style={styles.metricCount}>{count}</div>
              </div>
              <p style={styles.description}>{description}</p>
              <ProgressMeter count={count} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SustainabilityTracker;
