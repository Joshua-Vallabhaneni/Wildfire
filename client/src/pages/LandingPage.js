// client/src/pages/LandingPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (isVolunteer) => {
    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age || "0", 10),
          isVolunteer,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      navigate(`/${isVolunteer ? "volunteer" : "requester"}/${data._id}/background-check`);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    }
  };

  const styles = {
    container: {
      minHeight: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
      padding: "2rem",
      fontFamily: '"Inter", -apple-system, sans-serif',
      color: "#1a1a1a",
      position: "relative",
      overflow: "hidden",
    },
    backgroundLayer1: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "radial-gradient(circle at 50% -20%, #FF4500, transparent)",
      opacity: 0.3,
      animation: "pulse 2s infinite",
    },
    backgroundLayer2: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "radial-gradient(circle at 30% 100%, #FFA500, transparent)",
      opacity: 0.2,
    },
    logoContainer: {
      width: "64px",
      height: "64px",
      background: "linear-gradient(135deg, #FF4500, #FFA500)",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 2rem",
      boxShadow: "0 4px 20px rgba(255, 69, 0, 0.2)",
      transition: "transform 0.3s ease",
      cursor: "pointer",
      // Note: Inline styles do not support pseudo-selectors like :hover
      // To achieve hover effects, consider using CSS classes or a CSS-in-JS library
    },
    logo: {
      width: "48px",
      height: "48px",
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderRadius: "24px",
      padding: "48px 40px",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 165, 0, 0.2)",
      width: "100%",
      maxWidth: "520px",
      position: "relative",
      boxShadow: "0 16px 40px rgba(255, 69, 0, 0.1)",
    },
    titleContainer: {
      textAlign: "center",
      marginBottom: "40px",
    },
    mainTitle: {
      background: "linear-gradient(135deg, #FF4500, #FFA500)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontSize: "2.5rem",
      fontWeight: 800,
      marginBottom: "12px",
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
    },
    subtitle: {
      color: "#666666",
      fontSize: "1.1rem",
      fontWeight: 400,
      lineHeight: 1.5,
      maxWidth: "400px",
      margin: "0 auto",
    },
    inputGroup: {
      marginBottom: "1.75rem",
    },
    label: {
      display: "block",
      marginBottom: "0.65rem",
      color: "#4a4a4a",
      fontSize: "0.9rem",
      fontWeight: 500,
      letterSpacing: "0.5px",
    },
    input: {
      width: "100%",
      padding: "14px 18px",
      borderRadius: "12px",
      border: "1px solid rgba(255, 165, 0, 0.2)",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      color: "#1a1a1a",
      fontFamily: '"Inter", sans-serif',
      outline: "none",
      // Note: Inline styles do not support pseudo-selectors like :hover or :focus
      // To achieve hover and focus effects, consider using CSS classes or a CSS-in-JS library
    },
    buttonContainer: {
      display: "flex",
      gap: "1rem",
      marginTop: "2.5rem",
      flexDirection: "column",
    },
    primaryButton: {
      padding: "17px 24px",
      borderRadius: "12px",
      border: "none",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "linear-gradient(135deg, #FF4500, #FFA500)",
      color: "#fff",
      boxShadow: "0 4px 20px rgba(255, 69, 0, 0.2)",
      position: "relative",
      overflow: "hidden",
      // Note: Inline styles do not support pseudo-selectors like :hover or :active
      // To achieve hover and active effects, consider using CSS classes or a CSS-in-JS library
    },
    secondaryButton: {
      padding: "17px 24px",
      borderRadius: "12px",
      border: "2px solid rgba(255, 69, 0, 0.2)",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      color: "#FF4500",
      // Note: Inline styles do not support pseudo-selectors like :hover or :active
      // To achieve hover and active effects, consider using CSS classes or a CSS-in-JS library
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundLayer1} />
      <div style={styles.backgroundLayer2} />

      <div style={styles.card}>
        <div style={styles.logoContainer}>
          {/* 
            Replaced SVG with img tag referencing favicon.ico 
            Ensure favicon.ico is placed in the public folder.
          */}
          <img
            src="/favicon.ico"
            alt="Logo"
            style={styles.logo}
          />
        </div>

        <div style={styles.titleContainer}>
          <h1 style={styles.mainTitle}>FireSync</h1>
          <p style={styles.subtitle}>Connect with Relief Efforts and Recovery Resources</p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number</label>
          <input
            style={styles.input}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            type="tel"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Enter your email address"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Age</label>
          <input
            style={styles.input}
            name="age"
            value={formData.age}
            onChange={handleChange}
            type="number"
            placeholder="Enter your age"
            min="0"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Location</label>
          <input
            style={styles.input}
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your location"
          />
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={() => handleSubmit(false)}
            style={styles.primaryButton}
          >
            Looking for help?
          </button>
          <button
            onClick={() => handleSubmit(true)}
            style={styles.secondaryButton}
          >
            Looking to help?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
