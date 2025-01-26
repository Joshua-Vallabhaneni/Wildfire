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
        const matchRes = await fetch(`http://localhost:8080/api/matching/${volunteerId}`);
        if (!matchRes.ok) throw new Error("Failed to fetch matches");
        
        const { privateOrgs, requestorTasks, governmentOrgs } = await matchRes.json();
        
        setPrivateOrgs(privateOrgs);
        setRequestorTasks(requestorTasks);
        setGovernmentOrgs(governmentOrgs);
      } catch (err) {
        setError(err.message);
        console.error("Error in fetchData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [volunteerId]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading matches...</div>
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
        <div style={styles.horizontalLayout}>
          <Column
            title="Private Organizations"
            items={privateOrgs}
            type="private"
            CardComponent={OrgCard}
            volunteerId={volunteerId}
          />
          <Column
            title="Individual Requesters"
            items={requestorTasks}
            type="requester"
            CardComponent={RequestorTaskCard}
            volunteerId={volunteerId}
          />
          <Column
            title="Government Organizations"
            items={governmentOrgs}
            type="government"
            CardComponent={OrgCard}
            volunteerId={volunteerId}
          />
        </div>
      </div>
    </div>
  );
}

function Column({ title, items, type, CardComponent, volunteerId }) {
  return (
    <div style={styles.column}>
      <h2 style={styles.columnTitle}>{title}</h2>
      <div style={styles.cardList}>
        {items.length === 0 ? (
          <p style={styles.emptyText}>No matching {title.toLowerCase()} found.</p>
        ) : (
          items.map((item, idx) => (
            <CardComponent
              key={idx}
              org={item}
              item={item}
              cardType={type}
              volunteerId={volunteerId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrgCard({ org, cardType, volunteerId }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const cardStyles = getCardStyles(cardType);

  const handleMessageClick = (e) => {
    e.stopPropagation();
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
        ...styles.baseCard,
        ...cardStyles.card,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{org.name || "Unknown Organization"}</div>
          <div style={styles.cardAddress}>{org.address || "No address provided"}</div>
          <div style={styles.matchScore}>Match Score: {(org.finalScore * 100).toFixed(1)}%</div>
        </div>
        <div style={styles.arrowIcon}>{expanded ? "▼" : "▶"}</div>
      </div>

      {expanded && (
        <div style={styles.expandedContent}>
          {(org.tasksRequested || []).map((task, idx) => (
            <div key={idx} style={styles.taskInfo}>
              <div><strong>Task Title:</strong> {task.title}</div>
              <div><strong>Urgency:</strong> {task.urgency}/10</div>
              <div><strong>Specialty Required:</strong> {task.specialtyRequired ? "Yes" : "No"}</div>
            </div>
          ))}
          <div style={styles.actionButtons}>
            <button
              onClick={handleMessageClick}
              style={styles.messageButton}
            >
              💬 Message Organization
            </button>
            {org.link && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(org.link, "_blank");
                }}
                style={styles.websiteButton}
              >
                🌐 Visit Website
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestorTaskCard({ item, cardType, volunteerId }) {
  const [expanded, setExpanded] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const navigate = useNavigate();

  const cardStyles = getCardStyles(cardType);

  const handleMessageClick = (e) => {
    e.stopPropagation();
    navigate("/messages", {
      state: {
        userId: volunteerId,
        recipientId: item.requestorId,
        recipientName: item.requestorName || "Unknown User",
        isNewChat: true
      },
      replace: true
    });
  };

  return (
    <div
      style={{
        ...styles.baseCard,
        ...cardStyles.card,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{item.requestorName || "Unknown Person"}</div>
          <div style={styles.cardAddress}>{item.address || "No address provided"}</div>
          <div style={styles.matchScore}>Match Score: {(item.finalScore * 100).toFixed(1)}%</div>
        </div>
        <div style={styles.arrowIcon}>{expanded ? "▼" : "▶"}</div>
      </div>

      {expanded && (
        <div style={styles.expandedContent}>
          <div style={styles.taskInfo}>
            <div><strong>Task Title:</strong> {item.taskTitle}</div>
            <div><strong>Urgency:</strong> {item.urgency}/10</div>
            <div><strong>Specialty Required:</strong> {item.specialtyRequired ? "Yes" : "No"}</div>
          </div>
          <div style={styles.actionButtons}>
            <button
              onClick={handleMessageClick}
              style={styles.messageButton}
            >
              💬 Message Requester
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUploadDialog(true);
              }}
              style={styles.completeButton}
            >
              ✓ Complete Task
            </button>
          </div>
        </div>
      )}

      {showUploadDialog && (
        <UploadDialog
          onClose={() => setShowUploadDialog(false)}
          item={item}
          volunteerId={volunteerId}
        />
      )}
    </div>
  );
}

function UploadDialog({ onClose, item, volunteerId }) {
  const navigate = useNavigate();

  const handleFileUpload = async (file) => {
    try {
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
      onClose();
      navigate("/sustainability");
    } catch (error) {
      console.error('Error saving completed task:', error);
    }
  };

  return (
    <>
      <div style={styles.modalOverlay} onClick={onClose} />
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Upload Verification Document</h2>
        <p style={styles.modalText}>
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
          style={styles.fileInput}
        />
        <button onClick={onClose} style={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </>
  );
}

function getCardStyles(type) {
  switch (type) {
    case 'private':
      return {
        card: {
          backgroundColor: '#FFF5F0',
          borderColor: '#FFE0D0',
        }
      };
    case 'requester':
      return {
        card: {
          backgroundColor: '#F0F7FF',
          borderColor: '#D0E6FF',
        }
      };
    case 'government':
      return {
        card: {
          backgroundColor: '#F0FFF4',
          borderColor: '#D0FFE0',
        }
      };
    default:
      return {
        card: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E0E0E0',
        }
      };
  }
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  horizontalLayout: {
    display: 'flex',
    gap: '2rem',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '400px',
  },
  columnTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#444',
    marginBottom: '1rem',
  },
  baseCard: {
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.25rem',
  },
  cardAddress: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '0.25rem',
  },
  matchScore: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#444',
  },
  arrowIcon: {
    fontSize: '1rem',
    color: '#666',
    marginLeft: '0.5rem',
  },
  expandedContent: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  },
  taskInfo: {
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  messageButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0095F6',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  websiteButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#28a745',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  completeButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
  },
  modalContent: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    zIndex: 1000,
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  modalText: {
    color: '#666',
    marginBottom: '1rem',
  },
  fileInput: {
    marginBottom: '1rem',
  },
      cancelButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#666',
    color: 'white',
    cursor: 'pointer',
  },
  loadingContainer: {
    textAlign: 'center',
    marginTop: '3rem',
  },
  loadingText: {
    fontSize: '1.25rem',
    color: '#666',
  },
  errorBox: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '1rem',
    border: '1px solid #f5c2c7',
    backgroundColor: '#f8d7da',
    color: '#842029',
    borderRadius: '8px',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyText: {
    fontSize: '0.875rem',
    color: '#666',
    fontStyle: 'italic',
  },
};

export default MatchingDashboard;