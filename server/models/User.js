// server/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true },
  age: { type: Number },
  address: { type: String },
  isVolunteer: { type: Boolean, default: false },
  // For both requesters and volunteers, store their availability
  availability: {
    // Example structure: { Monday: ["6am-9am", "9am-12pm"], Tuesday: [...] }
    type: Object,
    default: {}
  },
  // For volunteers: store skills or tasks
  volunteerInterests: { type: String },

  // For requesters: store an array of tasks needed
  tasksRequested: [{ 
    title: String,
    urgency: Number,
    specialtyRequired: Boolean,
    category: String
  }],

  // background check status
  backgroundCheckStatus: { type: String, default: "pending" }
});

module.exports = mongoose.model("User", userSchema);
