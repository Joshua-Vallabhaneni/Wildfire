import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    address: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LandingPage.js
  const handleSubmit = async (isVolunteer) => {
    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          age: parseInt(formData.age || "0", 10), 
          isVolunteer 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Navigate to the correct initial step
      if (isVolunteer) {
        navigate(`/volunteer/${data._id}/background-check`);
      } else {
        navigate(`/requester/${data._id}/background-check`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      // Add some user feedback here
      alert("Error creating user. Please try again.");
    }
  };


  // Inline styles for immediate effect
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      backgroundColor: '#FAFAFA'
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
      width: '100%',
      maxWidth: '480px'
    },
    title: {
      color: '#FF9800',
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '2rem',
      textAlign: 'center'
    },
    inputGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#212121',
      fontSize: '0.875rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '8px',
      border: '2px solid #EEEEEE',
      fontSize: '1rem',
      transition: 'all 0.2s ease-in-out',
      marginBottom: '1rem'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    button: {
      flex: 1,
      padding: '1rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out'
    },
    primaryButton: {
      backgroundColor: '#FF9800',
      color: '#FFFFFF',
    },
    secondaryButton: {
      backgroundColor: '#FFFFFF',
      border: '2px solid #FF9800',
      color: '#FF9800'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Post-Wildfire Aid Web App</h1>
        <h2 style={{...styles.title, fontSize: '1.5rem'}}>Sign In / Sign Up</h2>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Name:</label>
          <input
            style={styles.input}
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone:</label>
          <input
            style={styles.input}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email:</label>
          <input
            style={styles.input}
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Age:</label>
          <input
            style={styles.input}
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Address (autofill):</label>
          <input
            style={styles.input}
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div style={styles.buttonContainer}>
          <button 
            onClick={() => handleSubmit(false)} 
            style={{...styles.button, ...styles.primaryButton}}
          >
            Looking for help?
          </button>
          <button 
            onClick={() => handleSubmit(true)} 
            style={{...styles.button, ...styles.secondaryButton}}
          >
            Looking to help?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;