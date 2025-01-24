import React from "react";

/**
 * Displays summary of background-check "online presence" results.
 * Now styled with an inline “card” approach to match the new design.
 */
const styles = {
  container: {
    backgroundColor: "#FFF",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: "1rem",
    color: "#333",
  },
  row: {
    display: "flex",
    alignItems: "start",
    marginBottom: "1rem",
  },
  icon: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginRight: "0.75rem",
    marginTop: "0.25rem",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
  },
  subtitle: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
    color: "#333",
  },
  description: {
    fontSize: "0.875rem",
    color: "#666",
  },
};

function BackgroundCheckStatus({ searchResults }) {
  const resultsCount = searchResults?.resultsFound || 0;
  const hasTrustedPresence = searchResults?.hasTrustedPresence || false;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Background Check Results</h3>

      <div style={styles.row}>
        <div
          style={{
            ...styles.icon,
            color: resultsCount > 0 ? "#4CAF50" : "#E53935",
          }}
        >
          {resultsCount > 0 ? "✓" : "✗"}
        </div>
        <div style={styles.textContainer}>
          <div style={styles.subtitle}>Online Presence</div>
          <div style={styles.description}>
            {resultsCount > 0
              ? `Found ${resultsCount} relevant result${resultsCount > 1 ? "s" : ""}`
              : "No significant online presence found"}
          </div>
        </div>
      </div>

      <div style={styles.row}>
        <div
          style={{
            ...styles.icon,
            color: hasTrustedPresence ? "#4CAF50" : "#E53935",
          }}
        >
          {hasTrustedPresence ? "✓" : "✗"}
        </div>
        <div style={styles.textContainer}>
          <div style={styles.subtitle}>Verified Platforms</div>
          <div style={styles.description}>
            {hasTrustedPresence
              ? "Present on trusted or official platforms"
              : "No presence on trusted platforms"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackgroundCheckStatus;
