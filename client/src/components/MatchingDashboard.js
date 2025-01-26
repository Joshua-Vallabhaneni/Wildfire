// client/src/components/MatchingDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MatchingDashboard({ volunteerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [privateOrgs, setPrivateOrgs] = useState([]);
  const [governmentOrgs, setGovernmentOrgs] = useState([]);
  const [requestorTasks, setRequestorTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) fetch matched tasks from /api/matching
        const matchRes = await fetch(`http://localhost:8080/api/matching/${volunteerId}`);
        if (!matchRes.ok) throw new Error("Failed to fetch matched tasks");
        const matchData = await matchRes.json();
        const { requestorTasks: matchedRequestors = [] } = matchData;
        setRequestorTasks(matchedRequestors);

        // 2) fetch all orgs from /api/orgs, then separate them
        const orgRes = await fetch("http://localhost:8080/api/orgs");
        if (!orgRes.ok) throw new Error("Failed to fetch orgs");
        const orgData = await orgRes.json();
        const priv = [];
        const gov = [];
        for (const org of orgData) {
          const lower = org.name.toLowerCase();
          if (lower.includes("fire") || lower.includes("lafd") || lower.includes("fema")) {
            gov.push(org);
          } else {
            priv.push(org);
          }
        }
        setPrivateOrgs(priv);
        setGovernmentOrgs(gov);
      } catch (err) {
        setError(err.message);
        console.error("Error in fetchData for MatchingDashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [volunteerId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <div style={{ fontSize: "1.25rem", color: "#666" }}>Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorBox}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Your Matched Opportunities</h1>
        <div style={styles.columnsWrapper}>
          {/* LEFT: Private Orgs */}
          <div style={styles.column}>
            <div style={styles.subheading}>Private Organizations</div>
            {privateOrgs.length === 0 ? (
              <p style={styles.emptyText}>No matching private organizations found.</p>
            ) : (
              privateOrgs.map((org, idx) => (
                <OrgCard key={idx} org={org} cardType="private" volunteerId={volunteerId} />
              ))
            )}
          </div>

          {/* MIDDLE: Individual Requesters */}
          <div style={styles.column}>
            <div style={styles.subheading}>Individual Requesters</div>
            {requestorTasks.length === 0 ? (
              <p style={styles.emptyText}>No matching individual requesters found.</p>
            ) : (
              requestorTasks.map((task, idx) => (
                <RequestorTaskCard key={idx} item={task} cardType="requester" volunteerId={volunteerId} />
              ))
            )}
          </div>

          {/* RIGHT: Government Orgs */}
          <div style={styles.column}>
            <div style={styles.subheading}>Government Organizations</div>
            {governmentOrgs.length === 0 ? (
              <p style={styles.emptyText}>No matching government organizations found.</p>
            ) : (
              governmentOrgs.map((org, idx) => (
                <OrgCard key={idx} org={org} cardType="government" volunteerId={volunteerId} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgCard({ org, cardType, volunteerId }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  let gradient = "linear-gradient(135deg, #f0f0f0, #ffffff)";
  let borderColor = "#ccc";
  if (cardType === "private") {
    gradient = "linear-gradient(135deg, #FFE5D4, #FFD1B8)";
    borderColor = "#FFC2A1";
  } else if (cardType === "government") {
    gradient = "linear-gradient(135deg, #E7F9EC, #D9F2E2)";
    borderColor = "#ADE7C7";
  }

  const arrowSymbol = expanded ? "▼" : "▶";

  const handleMessageClick = (e) => {
    e.stopPropagation();
    
    console.log('Opening message with organization:', {
      orgId: org._id,
      orgName: org.name
    });

    navigate("/messages", {
      state: {
        userId: volunteerId,
        recipientId: org._id,
        recipientName: org.name,
        isNewChat: true
      },
      replace: true
    });
  };

  return (
    <div
      style={{
        background: gradient,
        border: `1px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "1rem 1.2rem",
        marginBottom: "1rem",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease",
        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "#333" }}>
            {org.name || "Unknown Organization"}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#777", marginBottom: "0.5rem" }}>
            {org.address || "No address provided"}
          </div>
        </div>
        <div style={{ marginLeft: "0.5rem", fontWeight: "bold", fontSize: "1.25rem", color: "#444" }}>
          {arrowSymbol}
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#333", lineHeight: "1.4" }}>
          {(org.tasksRequested || []).map((t, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <div><strong>Task Title:</strong> {t.title}</div>
              <div><strong>Urgency:</strong> {t.urgency}/10</div>
              <div><strong>Specialty Required:</strong> {t.specialtyRequired ? "Yes" : "No"}</div>
              <div><strong>Category:</strong> {t.category || "N/A"}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={handleMessageClick}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#0095F6',
                color: '#fff',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0077E6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0095F6';
              }}
            >
              💬 Message Organization
            </button>
          </div>
          {org.link && (
            <div style={{ marginTop: '1rem' }}>
              <a
                href={org.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0056b3", textDecoration: "none", fontWeight: "500" }}
                onClick={(e) => e.stopPropagation()}
              >
                Visit Website &rarr;
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestorTaskCard({ item, cardType, volunteerId }) {
  const [expanded, setExpanded] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const navigate = useNavigate();

  let gradient = "linear-gradient(135deg, #E0F0FF, #D2E5FF)";
  let borderColor = "#B0D5FF";

  const name = item.requestorName || "Unknown Person";
  const address = item.address || "No address provided";
  const urgency = item.urgency || 0;
  const finalScore = item.finalScore || 0;

  let urgencyColor = "#333";
  if (urgency >= 8) urgencyColor = "#E53935";
  else if (urgency >= 5) urgencyColor = "#FB8C00";
  else urgencyColor = "#43A047";

  const arrowSymbol = expanded ? "▼" : "▶";

  const handleMessageClick = (e) => {
    e.stopPropagation();
    
    // Extract recipient details from item
    const recipientId = item.requester?.id || item.requestorId || item.userId;
    const recipientName = item.requestorName || item.requester?.name || "Unknown User";
    
    console.log('Opening message with:', {
      recipientId,
      recipientName,
      item
    });

    navigate("/messages", {
      state: {
        userId: volunteerId,
        recipientId: recipientId,
        recipientName: recipientName,
        isNewChat: true
      },
      replace: true
    });
  };

  const handleCompleteClick = (e) => {
    e.stopPropagation();
    setShowUploadDialog(true);
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadStatus('uploading');
      await fetch('http://localhost:8080/api/completed-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskTitle: item.taskTitle,
          userId: item.requestorId,
          completedBy: volunteerId,
          verificationDoc: file.name
        }),
      });

      setShowUploadDialog(false);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus(''), 3000);

      navigate("/sustainability");
    } catch (error) {
      console.error('Error saving completed task:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div
      style={{
        background: gradient,
        border: `1px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "1rem 1.2rem",
        marginBottom: "1rem",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease",
        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "#333" }}>
            {name}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#777", marginBottom: "0.5rem" }}>
            {address}
          </div>
        </div>
        <div style={{ marginLeft: "0.5rem", fontWeight: "bold", fontSize: "1.25rem", color: "#444" }}>
          {arrowSymbol}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#333", lineHeight: "1.4" }}>
          <div style={{ marginBottom: "0.4rem" }}><strong>Task Title:</strong> {item.taskTitle}</div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Urgency:</strong>{" "}
            <span style={{ color: urgencyColor }}>{urgency}/10</span>
          </div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Specialty Required:</strong>{" "}
            {item.specialtyRequired ? "Yes" : "No"}
          </div>
          <div style={{ marginBottom: "0.4rem" }}>
            <strong>Match Score:</strong>{" "}
            {(finalScore * 100).toFixed(1)}%
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              onClick={handleMessageClick}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#0095F6',
                color: '#fff',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0077E6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0095F6';
              }}
            >
              💬 Message {item.requestorName || item.requester?.name || "User"}
            </button>

            <button
              onClick={handleCompleteClick}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#4CAF50',
                color: '#fff',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3d8b40';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
              }}
            >
              ✓ Complete Task
            </button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 999
            }}
            onClick={() => setShowUploadDialog(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '24px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
              width: '90%',
              maxWidth: '500px',
              zIndex: 1000
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              Upload Verification Document
            </h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Please upload a document to verify task completion. Accepted formats: PDF, JPG, JPEG, PNG
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => setShowUploadDialog(false)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: '#666',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {uploadStatus && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1001
        }}>
          {uploadStatus === 'uploading' ? 'Uploading document...' : 'Task marked as complete!'}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
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
    fontSize: "2rem",
    fontWeight: 800,
    marginBottom: "2rem",
    textAlign: "center",
    color: "#333",
  },
  columnsWrapper: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
  },
  column: {
    flex: "1",
    minWidth: "280px",
    maxWidth: "360px",
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
  errorBox: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "1rem",
    border: "1px solid #f5c2c7",
    backgroundColor: "#f8d7da",
    color: "#842029",
    borderRadius: "8px",
  },
};

export default MatchingDashboard;