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
    address: ""
  });

  // We'll store userId after creation
  const [userId, setUserId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // For openrouteservice autocomplete, you'd typically query an endpoint on input change.
  // We'll skip the actual fetch for brevity, but here's how you'd do it:
  // fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=XXXX&text=${formData.address}`)
  //   .then(res => ...)

  const handleSubmit = async (isVolunteer) => {
    // Create user in backend
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
      const data = await response.json();
      setUserId(data._id);

      if (isVolunteer) {
        navigate(`/volunteer/${data._id}`);
      } else {
        navigate(`/requester/${data._id}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Post-Wildfire Aid Web App</h1>
      <h2>Sign In / Sign Up</h2>
      <div>
        <label>Name:</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
        /><br/>
        <label>Phone:</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        /><br/>
        <label>Email:</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
        /><br/>
        <label>Age:</label>
        <input
          name="age"
          value={formData.age}
          onChange={handleChange}
        /><br/>
        <label>Address (autofill):</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
        /><br/>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => handleSubmit(false)}>
          Looking for help?
        </button>
        <button onClick={() => handleSubmit(true)} style={{ marginLeft: "10px" }}>
          Looking to help?
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
