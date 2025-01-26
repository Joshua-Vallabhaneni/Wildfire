// src/components/MatchingDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MatchingDashboard({ volunteerId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allMatches, setAllMatches] = useState({
    privateOrgs: [],
    governmentOrgs: [],
    requestorTasks: []
  });
  const [displayedMatches, setDisplayedMatches] = useState({
    privateOrgs: [],
    governmentOrgs: [],
    requestorTasks: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    fetchData();
  }, [volunteerId]);

  const fetchData = async () => {
    try {
      const cachedData = localStorage.getItem(`matches_${volunteerId}`);
      const cachedTimestamp = localStorage.getItem(`matches_timestamp_${volunteerId}`);
      
      if (!refreshing && cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp, 10);
        if (age < 30 * 60 * 1000) { // 30 minutes
          const data = JSON.parse(cachedData);
          setAllMatches(data);
          updateDisplayedMatches(data, 1);
          setLoading(false);
          return;
        }
      }

      const matchRes = await fetch(
        `http://localhost:8080/api/matching/${volunteerId}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      if (!matchRes.ok) throw new Error("Failed to fetch matches");
      
      const data = await matchRes.json();
      
      const sortedData = {
        privateOrgs: data.privateOrgs.sort((a, b) => b.finalScore - a.finalScore),
        requestorTasks: data.requestorTasks.sort((a, b) => b.finalScore - a.finalScore),
        governmentOrgs: data.governmentOrgs.sort((a, b) => b.finalScore - a.finalScore)
      };

      localStorage.setItem(`matches_${volunteerId}`, JSON.stringify(sortedData));
      localStorage.setItem(`matches_timestamp_${volunteerId}`, Date.now().toString());
      
      setAllMatches(sortedData);
      updateDisplayedMatches(sortedData, 1);
    } catch (err) {
      setError(err.message);
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateDisplayedMatches = (matches, page) => {
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;

    setDisplayedMatches({
      privateOrgs: matches.privateOrgs.slice(startIdx, endIdx),
      requestorTasks: matches.requestorTasks.slice(startIdx, endIdx),
      governmentOrgs: matches.governmentOrgs.slice(startIdx, endIdx)
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const nextPage = currentPage + 1;
    
    const hasMoreItems = ['privateOrgs', 'requestorTasks', 'governmentOrgs'].some(category => {
      const startIdx = nextPage * ITEMS_PER_PAGE;
      return allMatches[category].length > startIdx;
    });

    const newPage = hasMoreItems ? nextPage : 1;
    setCurrentPage(newPage);
    updateDisplayedMatches(allMatches, newPage);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundLayer1} />
        <div style={styles.backgroundLayer2} />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Loading matches...</div>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundLayer1} />
        <div style={styles.backgroundLayer2} />
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundLayer1} />
      <div style={styles.backgroundLayer2} />
      <div style={styles.card}>
        <div style={styles.headerContainer}>
          <h1 style={styles.heading}>Your Matched Opportunities</h1>
          <button 
            onClick={handleRefresh} 
            style={{
              ...styles.refreshButton,
              background: "linear-gradient(135deg, #FF4500, #FFA500)",
              border: "none",
              boxShadow: "0 4px 20px rgba(255, 69, 0, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(255, 69, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 69, 0, 0.2)";
            }}
            disabled={refreshing}
          >
            {refreshing ? 'Loading...' : '🔄 Next Matches'}
          </button>
        </div>
        <div style={styles.horizontalLayout}>
          <Column
            title="Private Organizations"
            items={displayedMatches.privateOrgs}
            type="private"
            CardComponent={OrgCard}
            volunteerId={volunteerId}
          />
          <Column
            title="Individual Requesters"
            items={displayedMatches.requestorTasks}
            type="requester"
            CardComponent={RequestorTaskCard}
            volunteerId={volunteerId}
          />
          <Column
            title="Government Organizations"
            items={displayedMatches.governmentOrgs}
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
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        border: '1px solid #eee',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...cardStyles.card,
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      {/* Main Content */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#333' 
          }}>
            {org.name || "Unknown Organization"}
          </h3>
          <p style={{ 
            margin: '0 0 8px 0', 
            color: '#000',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>📍</span> {org.address || "No address provided"}
          </p>
          <p style={{ 
            margin: '0', 
            color: '#000',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>🤝</span> Match Score: {(org.finalScore * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          {(org.tasksRequested || []).map((task, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                <strong>Task:</strong> {task.title}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                <strong>Urgency:</strong> {task.urgency}/10
              </p>
              <p style={{ margin: '0', fontSize: '14px' }}>
                <strong>Specialty Required:</strong> {task.specialtyRequired ? "Yes" : "No"}
              </p>
            </div>
          ))}
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            marginTop: '16px'
          }}>
            <button
              onClick={handleMessageClick}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#FF4500',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF5722';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF4500';
              }}
            >
              💬 Message
            </button>
            {org.link && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(org.link, "_blank");
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                }}
              >
                🌐 Website
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
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        border: '1px solid #eee',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...cardStyles.card,
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      {/* Main Content */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#333' 
          }}>
            {item.requestorName || "Unknown Person"}
          </h3>
          <p style={{ 
            margin: '0 0 8px 0', 
            color: '#000',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>📍</span> {item.address || "No address provided"}
          </p>
          <p style={{ 
            margin: '0', 
            color: '#000',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>🤝</span> Match Score: {(item.finalScore * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
              <strong>Task:</strong> {item.taskTitle}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
              <strong>Urgency:</strong> {item.urgency}/10
            </p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              <strong>Specialty Required:</strong> {item.specialtyRequired ? "Yes" : "No"}
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            marginTop: '16px'
          }}>
            <button
              onClick={handleMessageClick}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#FF4500',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF5722';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF4500';
              }}
            >
              💬 Message
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUploadDialog(true);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#34d058',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#28a745';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#34d058';
              }}
            >
              ✓ Complete
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
          verificationDoc: file.name,
          category: item.category
        }),
      });
      onClose();
      // Updated navigation to match the app's routing structure
      navigate(`/volunteer/${volunteerId}/sustainability`, { 
        state: { 
          userId: volunteerId,
          justCompleted: true 
        },
        replace: true 
      });
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
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    padding: "2rem",
    border: "1px solid rgba(255, 165, 0, 0.2)",
    width: "100%",
    maxWidth: "1200px",
    margin: "2rem auto",
    boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingRight: '1rem',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    margin: 0,
  },
  refreshButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white',
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
    backdropFilter: "blur(8px)",
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
    backgroundColor: '#FF4500',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  websiteButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  completeButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#34d058',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
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
    boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333',
  },
  modalText: {
    color: '#666',
    marginBottom: '1rem',
  },
  fileInput: {
    marginBottom: '1rem',
    width: '100%',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#666',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingContainer: {
    textAlign: 'center',
    marginTop: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    position: 'relative',
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: "2rem",
    borderRadius: "24px",
    backdropFilter: "blur(16px)",
  },
  loadingText: {
    fontSize: '1.25rem',
    color: '#666',
    marginBottom: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 69, 0, 0.1)',
    borderTop: '4px solid #FF4500',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBox: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '1rem',
    border: '1px solid #f5c2c7',
    backgroundColor: 'rgba(248, 215, 218, 0.9)',
    color: '#842029',
    borderRadius: '8px',
    position: 'relative',
    zIndex: 1,
    backdropFilter: "blur(16px)",
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

// Add the animations to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0% { opacity: 0.3; }
    50% { opacity: 0.4; }
    100% { opacity: 0.3; }
  }
`;
document.head.appendChild(styleSheet);

export default MatchingDashboard;
