// client/src/pages/RequesterFlow/RequesterTasks.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RequesterTasks() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    title: "",
    urgency: 5,
    specialtyRequired: false,
    category: "Sustainability"
  });

  const handleChange = (e) => {
    setCurrentTask({ ...currentTask, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    setCurrentTask({ ...currentTask, specialtyRequired: e.target.checked });
  };

  const addTask = () => {
    setTasks([...tasks, currentTask]);
    setCurrentTask({
      title: "",
      urgency: 5,
      specialtyRequired: false,
      category: "Sustainability"
    });
  };

  const handleSubmit = async () => {
    // Put tasks in user table
    await fetch(`http://localhost:8080/api/users/${userId}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasksRequested: tasks })
    });
    navigate(`/requester/${userId}/background-check`);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Step 3: Tasks and Help Needed</h2>
      <div>
        <label>Task Description:</label>
        <input
          type="text"
          name="title"
          value={currentTask.title}
          onChange={handleChange}
        /><br/>
        <label>Urgency (1-10): {currentTask.urgency}</label><br/>
        <input
          type="range"
          min="1"
          max="10"
          name="urgency"
          value={currentTask.urgency}
          onChange={handleChange}
        /><br/>
        <label>Specialty Required? </label>
        <input
          type="checkbox"
          checked={currentTask.specialtyRequired}
          onChange={handleCheckbox}
        /><br/>
        <label>Category: </label>
        <select
          name="category"
          value={currentTask.category}
          onChange={handleChange}
        >
          <option value="Sustainability">Sustainability</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Safety and Prevention">Safety and Prevention</option>
          <option value="Emergency Response">Emergency Response</option>
        </select><br/>

        <button onClick={addTask}>Add Task</button>
      </div>

      <h3>Current Tasks:</h3>
      <ul>
        {tasks.map((t, i) => (
          <li key={i}>
            {t.title} - Urgency: {t.urgency}, Specialty: {t.specialtyRequired ? "Yes" : "No"}, {t.category}
          </li>
        ))}
      </ul>

      <button onClick={handleSubmit}>Next: Background Check</button>
    </div>
  );
}

export default RequesterTasks;
