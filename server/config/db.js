// server/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Test the connection by counting users
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`Number of users in database: ${userCount}`);
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;