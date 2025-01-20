// client/src/pages/SustainabilityTracker/SustainabilityTracker.js
import React, { useEffect, useState } from "react";

function SustainabilityTracker() {
  const [tasks, setTasks] = useState([]);
  const [showSubcategories, setShowSubcategories] = useState(false);
  // For simplicity, let's fetch all tasks and do some counting

  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(data);
      });
  }, []);

  // Count tasks by category
  const totalTasks = tasks.length;
  const countByCategory = (cat) => tasks.filter(t => t.category === cat).length;

  const sustainabilityCount = countByCategory("Sustainability");
  const infrastructureCount = countByCategory("Infrastructure");
  const safetyCount = countByCategory("Safety and Prevention");
  const emergencyCount = countByCategory("Emergency Response");

  // We can simulate subcategories
  // In a real app, you'd store subcategory info as well
  const ashCount = Math.round(sustainabilityCount * 0.25);
  const waterCount = Math.round(sustainabilityCount * 0.25);
  const habitatCount = Math.round(sustainabilityCount * 0.25);
  const soilCount = sustainabilityCount - (ashCount + waterCount + habitatCount);

  const completionPercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sustainability Tracker</h2>
      <p>Overall Recovery Progress: {completionPercentage(0, totalTasks)}% (placeholder, since we are not marking tasks as completed yet)</p>
      <div>
        <h3>Sustainability ({sustainabilityCount}/{totalTasks})</h3>
        <ProgressBar percentage={completionPercentage(sustainabilityCount, totalTasks)} />
        <button onClick={() => setShowSubcategories(!showSubcategories)}>
          {showSubcategories ? 'Hide' : 'View'} Subcategories
        </button>
        {showSubcategories && (
          <div style={{ marginLeft: "20px", marginTop: "5px" }}>
            <p>Ash & Debris Cleanup: {ashCount} tasks</p>
            <p>Water Conservation: {waterCount} tasks</p>
            <p>Habitat Restoration: {habitatCount} tasks</p>
            <p>Soil Stabilization: {soilCount} tasks</p>
          </div>
        )}
      </div>
      <h3>Infrastructure ({infrastructureCount}/{totalTasks})</h3>
      <ProgressBar percentage={completionPercentage(infrastructureCount, totalTasks)} />
      <h3>Safety and Prevention ({safetyCount}/{totalTasks})</h3>
      <ProgressBar percentage={completionPercentage(safetyCount, totalTasks)} />
      <h3>Emergency Response ({emergencyCount}/{totalTasks})</h3>
      <ProgressBar percentage={completionPercentage(emergencyCount, totalTasks)} />
    </div>
  );
}

function ProgressBar({ percentage }) {
  return (
    <div style={{ width: "300px", height: "20px", backgroundColor: "#ddd", marginBottom: "10px" }}>
      <div style={{
        width: `${percentage}%`,
        height: "100%",
        backgroundColor: "green"
      }} />
    </div>
  );
}

export default SustainabilityTracker;
