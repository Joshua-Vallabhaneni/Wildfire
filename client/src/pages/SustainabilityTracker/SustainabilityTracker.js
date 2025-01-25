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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users');
        const data = await response.json();
        const allTasks = data
          .filter(user => !user.isVolunteer)
          .flatMap(user => user.tasksRequested.map(task => ({
            ...task,
            userId: user._id,
            userName: user.name
          })));
        setTasks(allTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskComplete = (task) => {
    setSelectedTask(task);
    setShowUploadDialog(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setUploadStatus('uploading');
        
        await fetch('http://localhost:8080/api/completed-tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: selectedTask._id,
            userId: selectedTask.userId,
            category: selectedTask.category,
            completedBy: selectedTask.completedBy,
            verificationDoc: file.name
          }),
        });

        setCompletedTasks([...completedTasks, selectedTask]);
        setShowUploadDialog(false);
        setUploadStatus('success');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        console.error('Error saving completed task:', error);
        setUploadStatus('error');
      }
    }
  };

  const calculateProgress = (category) => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const completedCategoryTasks = completedTasks.filter(task => task.category === category);
    return categoryTasks.length > 0 
      ? (completedCategoryTasks.length / categoryTasks.length) * 100 
      : 0;
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
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(135deg, #FF4500, #FFA500)',
      transition: 'width 0.5s ease',
    },
    taskCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(255, 69, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    button: {
      background: 'linear-gradient(135deg, #FF4500, #FFA500)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    modal: {
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
      zIndex: 1000,
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 999,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Sustainability Tracker</h1>

        <div style={styles.progressContainer}>
          <h2 style={styles.categoryTitle}>Overall Progress</h2>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${totalProgress}%`}} />
          </div>
          <p style={{marginTop: '12px', color: '#666'}}>
            {completedTasks.length} of {tasks.length} tasks completed ({totalProgress.toFixed(1)}%)
          </p>
        </div>

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

        <div style={{marginTop: '32px'}}>
          <h2 style={styles.categoryTitle}>Outstanding Tasks</h2>
          {tasks.filter(task => !completedTasks.includes(task)).map((task, index) => (
            <div key={index} style={styles.taskCard}>
              <div>
                <h3 style={{fontWeight: 600, marginBottom: '4px'}}>{task.title}</h3>
                <p style={{color: '#666'}}>Category: {task.category}</p>
                <p style={{color: '#666'}}>Requested by: {task.userName}</p>
              </div>
              <button
                onClick={() => handleTaskComplete(task)}
                style={styles.button}
              >
                <Upload size={16} />
                Complete
              </button>
            </div>
          ))}
        </div>

        {showUploadDialog && (
          <>
            <div style={styles.overlay} onClick={() => setShowUploadDialog(false)} />
            <div style={styles.modal}>
              <h2 style={styles.categoryTitle}>Upload Verification Document</h2>
              <p style={{color: '#666', margin: '16px 0'}}>
                Please upload a document to verify task completion.
                Accepted formats: PDF, JPG, JPEG, PNG
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{marginBottom: '16px'}}
              />
              <button
                onClick={() => setShowUploadDialog(false)}
                style={{...styles.button, backgroundColor: '#666', marginTop: '16px'}}
              >
                Cancel
              </button>
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
          }}>
            {uploadStatus === 'uploading' ? 'Uploading document...' : 'Task marked as complete!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SustainabilityTracker;