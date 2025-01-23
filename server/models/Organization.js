// server/models/Organization.js
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String },
  address: { type: String },
  urgencyLevel: { type: Number },
  specialtyRequired: { type: Boolean },
  taskType: { type: String },

  // NEW FIELDS BELOW
  isVolunteer: { type: Boolean, default: false },
  tasksWilling: { type: Array, default: [] },
  tasksRequested: [
    {
      title: String,
      urgency: Number,
      specialtyRequired: Boolean,
      category: String
    }
  ],
  availability: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model("Organization", organizationSchema);
