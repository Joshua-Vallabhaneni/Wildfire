import React, { useEffect, useState } from "react";

/**
 * Determine background/border colors for the card.
 * (Each category uses a distinct pastel color.)
 */
function getCardStyle(type) {
  let backgroundColor = "#f9f9f9";
  let borderColor = "#ccc";

  if (type === "private") {
    backgroundColor = "#FFF7E6"; // Light orange
    borderColor = "#FFD8A8";
  } else if (type === "requester") {
    backgroundColor = "#EBF8FF"; // Light blue
    borderColor = "#BEE3F8";
  } else if (type === "government") {
    backgroundColor = "#F0FFF4"; // Light green
    borderColor = "#C6F6D5";
  }

  return {
    backgroundColor,
    border: `2px solid ${borderColor}`,
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1rem",
    cursor: "pointer",
    transition: "box-shadow 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
  };
}

/**
 * A single card with dropdown details. Color-coded per type (private/requester/government).
 */
const MatchCard = ({ item, cardType }) => {
  const [expanded, setExpanded] = useState(false);

  // Identify if this match is from an individual or an org:
  const isIndividual = !!item.requester;
  const name = isIndividual
    ? item.requester.name
    : (item.organization?.name || "Unknown Organization");
  const address = isIndividual
    ? "(Individual Requester)"
    : (item.organization?.address || "No address provided");
  const link = item.organization?.link;

  // For the arrow symbol:
  const arrowSymbol = expanded ? "▼" : "▶";

  // A bit of urgency color text for the displayed urgency:
  let urgencyColor = "#333";
  if (item.urgency >= 8) {
    urgencyColor = "red";
  } else if (item.urgency >= 5) {
    urgencyColor = "orange";
  } else {
    urgencyColor = "green";
  }

  // Inline styles
  const cardBaseStyle = getCardStyle(cardType);

  const titleStyle = {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "0.25rem",
  };

  const addressStyle = {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "0.5rem",
  };

  const arrowStyle = {
    marginLeft: "0.5rem",
    fontWeight: "bold",
    fontSize: "1.25rem",
    color: "#555",
  };

  const expandedSectionStyle = {
    marginTop: "0.75rem",
    fontSize: "0.9rem",
    color: "#333",
    lineHeight: "1.4",
  };

  return (
    <div
      style={cardBaseStyle}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.08)";
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
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Task Title:</strong> {item.title}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Urgency:</strong>{" "}
            <span style={{ color: urgencyColor }}>{item.urgency}/10</span>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Category:</strong> {item.category || "N/A"}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Specialty Required:</strong>{" "}
            {item.specialtyRequired ? "Yes" : "No"}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Match Score:</strong>{" "}
            {item.matchScore
              ? `${(item.matchScore * 100).toFixed(1)}%`
              : "N/A"}
          </div>
          {/* If there's a link, show it */}
          {link && (
            <div style={{ marginTop: "0.75rem" }}>
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

/**
 * The main matching dashboard: fetches tasks & displays them in 3 columns (PRIVATE - left, REQUESTERS - center, GOVERNMENT - right).
 */
const MatchingDashboard = ({ volunteerId }) => {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/matching/${volunteerId}`);
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

  // Some basic style objects for the 3-column layout
  const containerStyle = {
    width: "95%",
    maxWidth: "1200px",
    margin: "0 auto",
    marginTop: "2rem",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  };

  const columnStyle = {
    width: "33%",
  };

  const headingStyle = {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "1rem",
    textAlign: "left",
    color: "#222",
  };

  const subheadingStyle = {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#444",
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={headingStyle}>Your Matched Opportunities</h1>

      <div style={containerStyle}>
        {/* LEFT COLUMN: Private Orgs */}
        <div style={columnStyle}>
          <div style={subheadingStyle}>Private Organizations</div>
          {(!matches?.privateOrgs || matches.privateOrgs.length === 0) ? (
            <p style={{ fontSize: "0.9rem", color: "#777" }}>
              No matching private organizations found.
            </p>
          ) : (
            matches.privateOrgs.map((item, index) => (
              <MatchCard key={index} item={item} cardType="private" />
            ))
          )}
        </div>

        {/* MIDDLE COLUMN: Individual Requesters */}
        <div style={columnStyle}>
          <div style={subheadingStyle}>Individual Requesters</div>
          {(!matches?.requestorTasks || matches.requestorTasks.length === 0) ? (
            <p style={{ fontSize: "0.9rem", color: "#777" }}>
              No matching individual requesters found.
            </p>
          ) : (
            matches.requestorTasks.map((item, index) => (
              <MatchCard key={index} item={item} cardType="requester" />
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Government Orgs */}
        <div style={columnStyle}>
          <div style={subheadingStyle}>Government Organizations</div>
          {(!matches?.governmentOrgs || matches.governmentOrgs.length === 0) ? (
            <p style={{ fontSize: "0.9rem", color: "#777" }}>
              No matching government organizations found.
            </p>
          ) : (
            matches.governmentOrgs.map((item, index) => (
              <MatchCard key={index} item={item} cardType="government" />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingDashboard;
