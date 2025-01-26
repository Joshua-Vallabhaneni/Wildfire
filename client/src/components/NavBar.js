// src/components/NavBar.js
import React from "react";
import { Link } from "react-router-dom";

function NavBar({ userId }) {
  const styles = {
    navBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem 2rem",
    },
    navLinks: {
      display: "flex",
      gap: "2rem",
    },
    navLinkItem: {
      fontSize: "1.1rem",
      fontWeight: 600,
      textDecoration: "none",
      color: "#fff",
      backgroundColor: "#000",
      padding: "0.6rem 1.2rem",
      borderRadius: "8px",
      transition: "all 0.3s ease",
    },
  };

  return (
    <nav style={styles.navBar}>
      <div style={styles.navLinks}>
        <Link
          to={`/volunteer/${userId}/dashboard`}
          style={styles.navLinkItem}
        >
          Dashboard
        </Link>
        <Link
          to="/messages"
          state={{ userId: userId }}
          style={styles.navLinkItem}
        >
          Direct Messages
        </Link>
        <Link 
          to="/sustainability" 
          state={{ userId: userId }}
          style={styles.navLinkItem}
        >
          Sustainability Tracker
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
