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

  const addTask = async () => {
    try {
      const updatedTasks = [...tasks, currentTask];
      setTasks(updatedTasks);
  
      const response = await fetch(`http://localhost:8080/api/users/${userId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasksRequested: [currentTask] })
      });
  
      if (!response.ok) {
        throw new Error("Error adding the task to database");
      }
  
      // Reset form
      setCurrentTask({
        title: "",
        urgency: 5,
        specialtyRequired: false,
        category: "Sustainability"
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    navigate(`/requester/${userId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Tasks You Need Help With</h2>

          {/* Add Task Form */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description
              </label>
              <input
                type="text"
                name="title"
                value={currentTask.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the task you need help with"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level: {currentTask.urgency}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                name="urgency"
                value={currentTask.urgency}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low Priority</span>
                <span>High Priority</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={currentTask.specialtyRequired}
                onChange={handleCheckbox}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Requires Special Skills/Certification
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={currentTask.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="Sustainability">Sustainability</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Safety and Prevention">Safety and Prevention</option>
                <option value="Emergency Response">Emergency Response</option>
              </select>
            </div>

            <button
              onClick={addTask}
              disabled={!currentTask.title}
              className={`w-full px-4 py-2 rounded-md text-white font-medium
                ${currentTask.title 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              Add Task
            </button>
          </div>

          {/* Task List */}
          {tasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Tasks:</h3>
              <div className="space-y-3 mb-6">
                {tasks.map((task, i) => (
                  <div 
                    key={i}
                    className="bg-orange-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Category: {task.category}
                          {task.specialtyRequired && " • Requires Special Skills"}
                        </p>
                      </div>
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${task.urgency > 7 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                      `}>
                        Urgency: {task.urgency}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequesterTasks;