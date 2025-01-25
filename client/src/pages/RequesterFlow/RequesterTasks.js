import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "4rem 2rem",
    fontFamily: '"Inter", -apple-system, sans-serif',
    background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
    color: "#1a1a1a",
    position: "relative",
    overflow: "hidden",
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
    padding: "2rem",
    border: "1px solid rgba(255, 165, 0, 0.2)",
    width: "100%",
    maxWidth: "720px",
    boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
    color: "#333",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#333",
  },
  input: {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid rgba(255,165,0,0.2)",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
  },
  inputFocus: {
    border: "1px solid #FFA500",
    boxShadow: "0 0 4px rgba(255,165,0,0.3)",
  },
  rangeWrapper: {
    marginBottom: "1.5rem",
  },
  sliderLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0.25rem",
    fontSize: "0.8rem",
    color: "#666",
  },
  checkboxWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  checkbox: {
    transform: "scale(1.2)",
    marginRight: "0.5rem",
    cursor: "pointer",
  },
  select: {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid rgba(255,165,0,0.2)",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    outline: "none",
    marginBottom: "1.5rem",
    transition: "border 0.2s, box-shadow 0.2s",
  },
  button: {
    display: "inline-block",
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg, #FF4500, #FFA500)",
    color: "#fff",
    boxShadow: "0 4px 20px rgba(255, 69, 0, 0.2)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    marginBottom: "2rem",
    textAlign: "center",
  },
  buttonHover: {
    transform: "translateY(-2px) scale(1.02)",
    boxShadow: "0 6px 24px rgba(255, 69, 0, 0.3)",
  },
  tasksContainer: {
    marginBottom: "1.5rem",
  },
  taskCard: {
    backgroundColor: "#FFF7EF",
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "0.75rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  taskHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
  },
  taskTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: "0.5rem",
    color: "#333",
  },
  taskCategory: {
    fontSize: "0.85rem",
    color: "#777",
  },
  urgencyBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 600,
    textAlign: "center",
  },
};

function RequesterTasks() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    title: "",
    urgency: 5,
    specialtyRequired: false,
    category: "Sustainability",
  });
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setCurrentTask({ ...currentTask, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    setCurrentTask({ ...currentTask, specialtyRequired: e.target.checked });
  };

  const addTask = async () => {
    try {
      const updatedTasks = [...tasks, currentTask];
      setTasks(updatedTasks);

      const response = await fetch(`http://localhost:8080/api/users/${userId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasksRequested: [currentTask] }),
      });
      if (!response.ok) {
        throw new Error("Error adding the task to database");
      }

      // Reset form
      setCurrentTask({
        title: "",
        urgency: 5,
        specialtyRequired: false,
        category: "Sustainability",
      });
    } catch (error) {
      console.error(error);
      alert("Could not add task. Please try again.");
    }
  };

  const handleSubmit = () => {
    navigate(`/requester/${userId}/dashboard`);
  };

  const getUrgencyBadgeStyle = (urgency) => {
    if (urgency > 7) {
      return { backgroundColor: "#ffe5e5", color: "#d32f2f" }; // red-like
    } else if (urgency > 4) {
      return { backgroundColor: "#fff5e5", color: "#ef6c00" }; // orange-like
    } else {
      return { backgroundColor: "#e5ffea", color: "#2e7d32" }; // green-like
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundLayer1} />
      <div style={styles.backgroundLayer2} />

      <div style={styles.card}>
        <h2 style={styles.title}>Add Tasks You Need Help With</h2>

        {/* Task Creation Form */}
        <div style={{ marginBottom: "2rem" }}>
          {/* Title */}
          <label style={styles.label}>Task Description</label>
          <input
            name="title"
            style={{
              ...styles.input,
              ...(focusedField === "title" ? styles.inputFocus : {}),
            }}
            value={currentTask.title}
            onChange={handleChange}
            onFocus={() => setFocusedField("title")}
            onBlur={() => setFocusedField(null)}
            placeholder="Describe the task you need help with"
          />

          {/* Urgency (Range) */}
          <div style={styles.rangeWrapper}>
            <label style={styles.label}>
              Urgency Level: {currentTask.urgency}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              name="urgency"
              value={currentTask.urgency}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
            <div style={styles.sliderLabelRow}>
              <span>Low Priority</span>
              <span>High Priority</span>
            </div>
          </div>

          {/* Specialty Checkbox */}
          <div style={styles.checkboxWrapper}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={currentTask.specialtyRequired}
              onChange={handleCheckbox}
            />
            <label style={{ fontSize: "0.9rem", color: "#333" }}>
              Requires Special Skills/Certification
            </label>
          </div>

          {/* Category Select */}
          <label style={styles.label}>Category</label>
          <select
            name="category"
            value={currentTask.category}
            onChange={handleChange}
            style={{
              ...styles.select,
              ...(focusedField === "category" ? styles.inputFocus : {}),
            }}
            onFocus={() => setFocusedField("category")}
            onBlur={() => setFocusedField(null)}
          >
            <option value="Sustainability">Sustainability</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Safety and Prevention">Safety and Prevention</option>
            <option value="Emergency Response">Emergency Response</option>
          </select>

          <button
            onClick={addTask}
            disabled={!currentTask.title}
            style={{
              ...styles.button,
              opacity: currentTask.title ? 1 : 0.7,
              cursor: currentTask.title ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (currentTask.title) {
                e.currentTarget.style.transform = styles.buttonHover.transform;
                e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = styles.button.boxShadow;
            }}
          >
            Add Task
          </button>
        </div>

        {/* List of added tasks */}
        {tasks.length > 0 && (
          <div style={styles.tasksContainer}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#333", marginBottom: "1rem" }}>
              Your Tasks:
            </h3>
            {tasks.map((task, i) => (
              <div key={i} style={styles.taskCard}>
                <div style={styles.taskHeaderRow}>
                  <div>
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskCategory}>
                      Category: {task.category}
                      {task.specialtyRequired && " • Requires Special Skills"}
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.urgencyBadge,
                      ...getUrgencyBadgeStyle(task.urgency),
                    }}
                  >
                    Urgency: {task.urgency}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Finish / Dashboard button */}
        <button
          onClick={handleSubmit}
          style={{
            ...styles.button,
            maxWidth: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.buttonHover.transform;
            e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = styles.button.boxShadow;
          }}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

export default RequesterTasks;
