// server/index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config(); // load .env
connectDB();     // connect to MongoDB Atlas

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
// Removed the old tasks route
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/orgs", require("./routes/orgRoutes"));

app.use("/api/background-check", require("./routes/backgroundCheckRoutes"));

app.use("/api/matching", require("./routes/matchingRoutes")); // <--- IMPORTANT


// Simple test endpoint
app.get("/", (req, res) => {
  res.send("Server is running. Visit /api/... for API routes.");
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
