import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function getCardStyle(type) {
  let gradient = "linear-gradient(135deg, #f0f0f0, #ffffff)";
  let borderColor = "#ccc";

  if (type === "private") {
    gradient = "linear-gradient(135deg, #FFE5D4, #FFD1B8)";
    borderColor = "#FFC2A1";
  } else if (type === "requester") {
    gradient = "linear-gradient(135deg, #E0F0FF, #D2E5FF)";
    borderColor = "#B0D5FF";
  } else if (type === "government") {
    gradient = "linear-gradient(135deg, #E7F9EC, #D9F2E2)";
    borderColor = "#ADE7C7";
  }

  return {
    background: gradient,
    border: `1px solid ${borderColor}`,
    borderRadius: "16px",
    padding: "1rem 1.2rem",
    marginBottom: "1rem",
    cursor: "pointer",
    transition: "box-shadow 0.2s ease",
    boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
  };
}

const MatchCard = ({ item, cardType, volunteerId }) => {
  const [expanded, setExpanded] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const navigate = useNavigate();

  const isIndividual = !!item.requester;
  const name = isIndividual ? item.requester.name : (item.organization?.name || "Unknown Organization");
  const address = isIndividual ? "(Individual Requester)" : (item.organization?.address || "No address provided");
  const link = item.organization?.link;

  let urgencyColor = "#333";
  if (item.urgency >= 8) urgencyColor = "#E53935";
  else if (item.urgency >= 5) urgencyColor = "#FB8C00";
  else urgencyColor = "#43A047";

  const arrowSymbol = expanded ? "▼" : "▶";

  const handleMessageClick = (e) => {
    e.stopPropagation();
    navigate("/messages", {
      state: {
        userId: volunteerId,
        recipientId: item.requester?.id,
        recipientName: item.requester?.name,
        isNewChat: true,
      },
    });
  };

  const handleCompleteClick = (e) => {
    e.stopPropagation();
    navigate("/sustainability", {
      state: { taskToComplete: item, volunteerId: volunteerId }
    });
  };

  const styles = {
    buttonRow: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    },
    button: {
      padding: '0.6rem 1rem',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      color: '#fff',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    messageButton: {
      backgroundColor: '#0095F6',
    },
    completeButton: {
      backgroundColor: '#4CAF50',
    }
  };

  return (
    <div
      style={getCardStyle(cardType)}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "#333" }}>{name}</div>
          <div style={{ fontSize: "0.85rem", color: "#777", marginBottom: "0.5rem" }}>{address}</div>
        </div>
        <div style={{ marginLeft: "0.5rem", fontWeight: "bold", fontSize: "1.25rem", color: "#444" }}>{arrowSymbol}</div>
      </div>

      {expanded && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#333", lineHeight: "1.4" }}>
          <div style={{ marginBottom: "0.4rem" }}><strong>Task Title:</strong> {item.title}</div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Urgency:</strong> <span style={{ color: urgencyColor }}>{item.urgency}/10</span>
          </div>
          <div style={{ marginBottom: "0.4rem" }}><strong>Category:</strong> {item.category || "N/A"}</div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Specialty Required:</strong> {item.specialtyRequired ? "Yes" : "No"}
          </div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Match Score:</strong> {item.matchScore ? `${(item.matchScore * 100).toFixed(1)}%` : "N/A"}
          </div>

          <div style={styles.buttonRow}>
            {isIndividual && (
              <button 
                onClick={handleMessageClick} 
                style={{...styles.button, ...styles.messageButton}}
              >
                💬 Message {item.requester.name}
              </button>
            )}
            <button 
              onClick={handleCompleteClick}
              style={{...styles.button, ...styles.completeButton}}
            >
              ✓ Complete Task
            </button>
          </div>

          {link && (
            <div style={{ marginTop: "0.6rem" }}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: "#0056b3", textDecoration: "none", fontWeight: "500" }}
              >
                Visit Website &rarr;
              </a>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};

const MatchingDashboard = ({ volunteerId }) => {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/matching/${volunteerId}`);
        if (!response.ok) throw new Error("Failed to fetch matches");
        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [volunteerId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <div style={{ fontSize: "1.25rem", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #f5c2c7",
        backgroundColor: "#f8d7da",
        color: "#842029",
        borderRadius: "8px",
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  const styles = {
    container: {
      background: "transparent",
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(12px)",
      borderRadius: "24px",
      padding: "2rem",
      width: "100%",
      boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
    },
    heading: {
      fontSize: "2.2rem",
      fontWeight: 800,
      marginBottom: "1.5rem",
      textAlign: "center",
      color: "#333",
      letterSpacing: "-0.02em",
    },
    columnsWrapper: {
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      justifyContent: "space-between",
    },
    column: {
      flex: "1",
      minWidth: "250px",
      maxWidth: "380px",
    },
    subheading: {
      fontSize: "1.25rem",
      fontWeight: 600,
      marginBottom: "1rem",
      color: "#444",
      borderBottom: "1px solid #eee",
      paddingBottom: "0.5rem",
    },
    emptyText: {
      fontSize: "0.9rem",
      color: "#777",
    },
  };

  const privateOrgs = matches?.privateOrgs || [];
  const requestorTasks = matches?.requestorTasks || [];
  const governmentOrgs = matches?.governmentOrgs || [];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Your Matched Opportunities</h1>
        <div style={styles.columnsWrapper}>
          <div style={styles.column}>
            <div style={styles.subheading}>Private Organizations</div>
            {privateOrgs.length === 0 ? (
              <p style={styles.emptyText}>No matching private organizations found.</p>
            ) : (
              privateOrgs.map((item, index) => (
                <MatchCard key={index} item={item} cardType="private" volunteerId={volunteerId} />
              ))
            )}
          </div>

          <div style={styles.column}>
            <div style={styles.subheading}>Individual Requesters</div>
            {requestorTasks.length === 0 ? (
              <p style={styles.emptyText}>No matching individual requesters found.</p>
            ) : (
              requestorTasks.map((item, index) => (
                <MatchCard key={index} item={item} cardType="requester" volunteerId={volunteerId} />
              ))
            )}
          </div>

          <div style={styles.column}>
            <div style={styles.subheading}>Government Organizations</div>
            {governmentOrgs.length === 0 ? (
              <p style={styles.emptyText}>No matching government organizations found.</p>
            ) : (
              governmentOrgs.map((item, index) => (
                <MatchCard key={index} item={item} cardType="government" volunteerId={volunteerId} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingDashboard;