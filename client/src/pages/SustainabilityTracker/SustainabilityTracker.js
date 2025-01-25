import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

const categories = {
  Sustainability: "Environmental recovery and conservation efforts",
  Infrastructure: "Rebuilding essential community structures",
  "Safety and Prevention": "Implementation of safety measures and prevention strategies",
  "Emergency Response": "Immediate response and relief efforts"
};

const SustainabilityTracker = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const fetchData = async () => {
    try {
      // Fetch all tasks
      const tasksResponse = await fetch('http://localhost:8080/api/users');
      const tasksData = await tasksResponse.json();
      const allTasks = tasksData
        .filter(user => !user.isVolunteer)
        .flatMap(user => user.tasksRequested);
      setTasks(allTasks);

      // Fetch completed tasks
      const completedResponse = await fetch('http://localhost:8080/api/completed-tasks');
      const completedData = await completedResponse.json();
      setCompletedTasks(completedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskComplete = (task) => {
    setSelectedTask(task);
    setShowUploadDialog(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadStatus('uploading');

      // Simplified - just send basic task info
      await fetch('http://localhost:8080/api/completed-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: selectedTask._id,
          taskTitle: selectedTask.title,
          category: selectedTask.category,
          verificationDoc: 'document.pdf' // Placeholder
        }),
      });

      // Update local state
      setCompletedTasks(prev => [...prev, selectedTask]);
      
      // Refetch data to update progress
      await fetchData();

      setShowUploadDialog(false);
      setUploadStatus('success');
      
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error completing task:', error);
      setUploadStatus('error');
    }
  };

  const calculateProgress = (category) => {
    const tasksInCategory = tasks.filter(task => task.category === category).length;
    const completedInCategory = completedTasks.filter(task => task.category === category).length;
    return tasksInCategory > 0 ? (completedInCategory / tasksInCategory) * 100 : 0;
  };

  const totalProgress = tasks.length > 0 
    ? (completedTasks.length / tasks.length) * 100 
    : 0;

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)',
      padding: '2rem',
      fontFamily: '"Inter", -apple-system, sans-serif',
    },
    content: {
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '24px',
      padding: '48px 40px',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 165, 0, 0.2)',
      boxShadow: '0 16px 40px rgba(255, 69, 0, 0.1)',
    },
    title: {
      background: 'linear-gradient(135deg, #FF4500, #FFA500)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontSize: '2.5rem',
      fontWeight: 800,
      marginBottom: '2rem',
      textAlign: 'center',
    },
    progressContainer: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(255, 69, 0, 0.1)',
    },
    categoryTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      background: 'linear-gradient(135deg, #FF4500, #FFA500)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    progressBar: {
      backgroundColor: '#FFE5D6',
      borderRadius: '12px',
      height: '8px',
      overflow: 'hidden',
      marginTop: '12px',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(135deg, #FF4500, #FFA500)',
      transition: 'width 0.5s ease',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Sustainability Tracker</h1>

        {/* Overall Progress */}
        <div style={styles.progressContainer}>
          <h2 style={styles.categoryTitle}>Overall Progress</h2>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${totalProgress}%`}} />
          </div>
          <p style={{marginTop: '12px', color: '#666'}}>
            {completedTasks.length} of {tasks.length} tasks completed ({totalProgress.toFixed(1)}%)
          </p>
        </div>

        {/* Category Progress */}
        {Object.entries(categories).map(([category, description]) => {
          const progress = calculateProgress(category);
          return (
            <div key={category} style={styles.progressContainer}>
              <h2 style={styles.categoryTitle}>{category}</h2>
              <p style={{color: '#666', marginBottom: '12px'}}>{description}</p>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${progress}%`}} />
              </div>
              <p style={{marginTop: '8px', color: '#666'}}>{progress.toFixed(1)}% Complete</p>
            </div>
          );
        })}

        {/* Upload Dialog */}
        {showUploadDialog && (
          <>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }} onClick={() => setShowUploadDialog(false)} />
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '24px',
              width: '90%',
              maxWidth: '500px',
              zIndex: 1000
            }}>
              <h2 style={{marginBottom: '1rem'}}>Upload Verification</h2>
              <input
                type="file"
                accept="*/*"
                onChange={handleFileUpload}
              />
              <button onClick={() => setShowUploadDialog(false)}
                style={{marginTop: '1rem', padding: '8px 16px'}}>
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Task List */}
        <div style={{marginTop: '32px'}}>
          <h2 style={styles.categoryTitle}>Outstanding Tasks</h2>
          {tasks.filter(task => !completedTasks.some(ct => ct.taskId === task._id))
            .map((task, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3>{task.title}</h3>
                  <p>Category: {task.category}</p>
                </div>
                <button onClick={() => handleTaskComplete(task)}
                  style={{
                    background: 'linear-gradient(135deg, #FF4500, #FFA500)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                  Complete Task
                </button>
              </div>
            ))}
        </div>

        {/* Status Notification */}
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
            {uploadStatus === 'uploading' ? 'Marking as complete...' : 'Task completed!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SustainabilityTracker;