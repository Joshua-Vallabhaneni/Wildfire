// server/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true },
  age: { type: Number },
  address: { type: String },
  // isVolunteer: true => volunteer, false => requester
  isVolunteer: { type: Boolean, default: false },

  // Availability for both requesters and volunteers
  // e.g. { Monday: ["6am-9am", "9am-12pm"], Tuesday: [...] }
  availability: {
    type: Object,
    default: {}
  },

  // Volunteers: an array of objects with a single "title" field
  tasksWilling: [
    {
      title: String
    }
  ],

  // Requesters: array of task objects
  tasksRequested: [
    {
      title: String,
      urgency: Number,
      specialtyRequired: Boolean,
      category: String
    }
  ],

  // Background check status
  backgroundCheckStatus: {
    type: String,
    default: "pending"
  }
});

module.exports = mongoose.model("User", userSchema);
