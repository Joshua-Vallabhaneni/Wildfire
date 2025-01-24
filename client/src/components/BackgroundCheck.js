import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackgroundCheckStatus from "./BackgroundCheckStatus";

/**
 * Inline styles for the modern, orange-themed background check page.
 */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
    padding: "2rem",
    fontFamily: '"Inter", -apple-system, sans-serif',
    color: "#1a1a1a",
    position: "relative",
    overflow: "hidden",
  },
  backgroundLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 50% -20%, #FF4500, transparent)",
    opacity: 0.3,
    animation: "pulse 2s infinite",
  },
  backgroundLayer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 30% 100%, #FFA500, transparent)",
    opacity: 0.2,
  },
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    padding: "48px 40px",
    border: "1px solid rgba(255, 165, 0, 0.2)",
    width: "100%",
    maxWidth: "640px",
    boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    marginBottom: "1rem",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    background: "linear-gradient(135deg, #FF4500, #FFA500)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
  },
  statusBlock: {
    marginBottom: "1.5rem",
    padding: "1rem",
    borderRadius: "12px",
    backgroundColor: "#FFF7EF",
    border: "1px solid rgba(255, 165, 0, 0.2)",
    textAlign: "center",
  },
  statusLabel: {
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#333",
  },
  statusValue: {
    fontSize: "1.4rem",
    fontWeight: 700,
  },
  proceedButton: {
    display: "inline-block",
    padding: "16px 24px",
    borderRadius: "12px",
    border: "none",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    background: "linear-gradient(135deg, #FF4500, #FFA500)",
    color: "#fff",
    boxShadow: "0 4px 20px rgba(255, 69, 0, 0.2)",
    marginTop: "1rem",
  },
  proceedButtonHover: {
    transform: "translateY(-2px) scale(1.02)",
    boxShadow: "0 6px 24px rgba(255, 69, 0, 0.3)",
  },

  /* ========== Technical Details (Expandable) ========== */
  detailsToggleBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "#F9FAFB",
    padding: "1rem",
    borderRadius: "12px",
    marginBottom: "1rem",
    border: "1px solid #eaeaea",
    userSelect: "none",
  },
  detailsToggleTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#333",
  },
  detailsContent: {
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    padding: "1rem",
    border: "1px solid #eaeaea",
    marginBottom: "1.5rem",
  },
  debugLabelBox: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "0.8rem",
    marginBottom: "0.8rem",
    fontSize: "0.9rem",
    color: "#444",
  },
  arrowIcon: {
    transition: "transform 0.3s ease",
    fontSize: "1.25rem",
    marginLeft: "0.5rem",
  },
};

/**
 * A background check component with a "show more" toggle 
 * for the technical debug details.
 */
function BackgroundCheck({ userType }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  // The main background-check status
  const [status, setStatus] = useState("Processing...");
  // Optional debug info from SERP API
  const [debugInfo, setDebugInfo] = useState(null);
  // For toggling the technical details panel
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const runCheck = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/background-check/${userId}/runBackgroundCheck`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await res.json();

        if (data.backgroundCheckStatus === "approved") {
          setStatus("Approved");
        } else if (data.backgroundCheckStatus === "failed") {
          setStatus("Failed");
        } else {
          setStatus("Error");
        }

        if (data.debugInfo) {
          setDebugInfo(data.debugInfo);
        }
      } catch (error) {
        console.error("Error running background check:", error);
        setStatus("Error");
        setDebugInfo({ error: error.message });
      }
    };

    runCheck();
  }, [userId]);

  const proceed = () => {
    if (status === "Approved") {
      navigate(`/${userType}/${userId}/availability`);
    } else {
      alert("Background check failed or still processing. Cannot proceed.");
    }
  };

  // Color-coded status
  const statusColor =
    status === "Approved"
      ? "#4CAF50" // green
      : status === "Failed"
      ? "#E53935" // red
      : "#FF9800"; // orange for processing/error

  return (
    <div style={styles.container}>
      <div style={styles.backgroundLayer1} />
      <div style={styles.backgroundLayer2} />

      <div style={styles.card}>
        {/* Title */}
        <h1 style={styles.title}>
          {userType === "requester" ? "Requester" : "Volunteer"} Background Check
        </h1>

        {/* Status Section */}
        <div style={styles.statusBlock}>
          <div style={styles.statusLabel}>Status</div>
          <div style={{ ...styles.statusValue, color: statusColor }}>{status}</div>

          {status === "Approved" && (
            <button
              type="button"
              style={styles.proceedButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = styles.proceedButtonHover.transform;
                e.currentTarget.style.boxShadow = styles.proceedButtonHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = styles.proceedButton.boxShadow;
              }}
              onClick={proceed}
            >
              Proceed to Next Step
            </button>
          )}
        </div>

        {/* If debug info is present, show a toggle for "Technical Details" */}
        {debugInfo && (
          <>
            <div
              style={styles.detailsToggleBar}
              onClick={() => setShowDetails(!showDetails)}
            >
              <div style={styles.detailsToggleTitle}>Technical Details</div>
              <div
                style={{
                  ...styles.arrowIcon,
                  transform: showDetails ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </div>
            </div>

            {showDetails && (
              <div style={styles.detailsContent}>
                {/* The top portion: status summary with checkmarks */}
                {debugInfo.nameResults && (
                  <BackgroundCheckStatus
                    searchResults={{
                      resultsFound: debugInfo.nameResults.resultsFound,
                      hasTrustedPresence: debugInfo.nameResults.hasTrustedPresence,
                    }}
                  />
                )}

                {/* Additional debug fields (search query, reason, etc.) */}
                {debugInfo.nameQuery && (
                  <div style={styles.debugLabelBox}>
                    <strong>Search Query:</strong> {debugInfo.nameQuery}
                  </div>
                )}
                {debugInfo.totalResults !== undefined && (
                  <div style={styles.debugLabelBox}>
                    <strong>Total Results:</strong> {debugInfo.totalResults}
                  </div>
                )}
                {debugInfo.reasonForStatus && (
                  <div style={styles.debugLabelBox}>
                    <strong>Reason for Status:</strong> {debugInfo.reasonForStatus}
                  </div>
                )}
                {debugInfo.error && (
                  <div style={styles.debugLabelBox}>
                    <strong>Error:</strong> {debugInfo.error}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BackgroundCheck;
