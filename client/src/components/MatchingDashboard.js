// client/src/components/MatchingDashboard.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Determine a gradient background and border color for each card type
 * (e.g., "private", "requester", "government").
 */
function getCardStyle(type) {
  let gradient = "linear-gradient(135deg, #f0f0f0, #ffffff)";
  let borderColor = "#ccc";

  if (type === "private") {
    // Soft orange gradient
    gradient = "linear-gradient(135deg, #FFE5D4, #FFD1B8)";
    borderColor = "#FFC2A1";
  } else if (type === "requester") {
    // Soft blue gradient
    gradient = "linear-gradient(135deg, #E0F0FF, #D2E5FF)";
    borderColor = "#B0D5FF";
  } else if (type === "government") {
    // Soft green gradient
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

/**
 * A single match card. Clicking it expands/hides extra details.
 */
const MatchCard = ({ item, cardType, volunteerId }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Distinguish between individual or organization:
  const isIndividual = !!item.requester;
  const name = isIndividual
    ? item.requester.name
    : (item.organization?.name || "Unknown Organization");
  const address = isIndividual
    ? "(Individual Requester)"
    : (item.organization?.address || "No address provided");
  const link = item.organization?.link;

  // Provide a color-coded urgency
  let urgencyColor = "#333";
  if (item.urgency >= 8) {
    urgencyColor = "#E53935"; // red
  } else if (item.urgency >= 5) {
    urgencyColor = "#FB8C00"; // orange
  } else {
    urgencyColor = "#43A047"; // green
  }

  const arrowSymbol = expanded ? "▼" : "▶";

  const handleMessageClick = (e) => {
    e.stopPropagation(); // Prevent toggling expansion
    navigate("/messages", {
      state: {
        userId: volunteerId,
        recipientId: item.requester?.id,
        recipientName: item.requester?.name,
        isNewChat: true,
      },
    });
  };

  // Base styling for the card
  const cardBaseStyle = getCardStyle(cardType);

  // Inline style overrides
  const titleStyle = {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
    color: "#333",
  };
  const addressStyle = {
    fontSize: "0.85rem",
    color: "#777",
    marginBottom: "0.5rem",
  };
  const arrowStyle = {
    marginLeft: "0.5rem",
    fontWeight: "bold",
    fontSize: "1.25rem",
    color: "#444",
  };
  const expandedSectionStyle = {
    marginTop: "0.75rem",
    fontSize: "0.9rem",
    color: "#333",
    lineHeight: "1.4",
  };
  const messageButtonStyle = {
    backgroundColor: "#0095F6",
    color: "#fff",
    padding: "0.6rem 1rem",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    marginTop: "0.5rem",
  };

  return (
    <div
      style={cardBaseStyle}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";
      }}
    >
      {/* Top row: name + arrow */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={titleStyle}>{name}</div>
          <div style={addressStyle}>{address}</div>
        </div>
        <div style={arrowStyle}>{arrowSymbol}</div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={expandedSectionStyle}>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Task Title:</strong> {item.title}
          </div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Urgency:</strong>{" "}
            <span style={{ color: urgencyColor }}>{item.urgency}/10</span>
          </div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Category:</strong> {item.category || "N/A"}
          </div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Specialty Required:</strong>{" "}
            {item.specialtyRequired ? "Yes" : "No"}
          </div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Match Score:</strong>{" "}
            {item.matchScore
              ? `${(item.matchScore * 100).toFixed(1)}%`
              : "N/A"}
          </div>

          {isIndividual && (
            <button onClick={handleMessageClick} style={messageButtonStyle}>
              <span role="img" aria-label="chat">
                💬
              </span>{" "}
              Message {item.requester.name}
            </button>
          )}

          {link && (
            <div style={{ marginTop: "0.6rem" }}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  color: "#0056b3",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
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

/**
 * The main matching dashboard that displays
 * private orgs, individual requesters, and government org matches.
 */
const MatchingDashboard = ({ volunteerId }) => {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/matching/${volunteerId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }
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
      <div
        style={{
          maxWidth: "600px",
          margin: "2rem auto",
          padding: "1rem",
          border: "1px solid #f5c2c7",
          backgroundColor: "#f8d7da",
          color: "#842029",
          borderRadius: "8px",
        }}
      >
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // For columns and card container
  const styles = {
    container: {
      // Transparent so it blends with the VolunteerDashboard's orange background
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

  // Data arrays
  const privateOrgs = matches?.privateOrgs || [];
  const requestorTasks = matches?.requestorTasks || [];
  const governmentOrgs = matches?.governmentOrgs || [];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Your Matched Opportunities</h1>

        <div style={styles.columnsWrapper}>
          {/* Private Orgs */}
          <div style={styles.column}>
            <div style={styles.subheading}>Private Organizations</div>
            {privateOrgs.length === 0 ? (
              <p style={styles.emptyText}>
                No matching private organizations found.
              </p>
            ) : (
              privateOrgs.map((item, index) => (
                <MatchCard
                  key={index}
                  item={item}
                  cardType="private"
                  volunteerId={volunteerId}
                />
              ))
            )}
          </div>

          {/* Individual Requesters */}
          <div style={styles.column}>
            <div style={styles.subheading}>Individual Requesters</div>
            {requestorTasks.length === 0 ? (
              <p style={styles.emptyText}>
                No matching individual requesters found.
              </p>
            ) : (
              requestorTasks.map((item, index) => (
                <MatchCard
                  key={index}
                  item={item}
                  cardType="requester"
                  volunteerId={volunteerId}
                />
              ))
            )}
          </div>

          {/* Government Orgs */}
          <div style={styles.column}>
            <div style={styles.subheading}>Government Organizations</div>
            {governmentOrgs.length === 0 ? (
              <p style={styles.emptyText}>
                No matching government organizations found.
              </p>
            ) : (
              governmentOrgs.map((item, index) => (
                <MatchCard
                  key={index}
                  item={item}
                  cardType="government"
                  volunteerId={volunteerId}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingDashboard;
