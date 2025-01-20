// server/models/Organization.js

const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String },
  address: { type: String },
  urgencyLevel: { type: Number }, // 1-10 for example
  specialtyRequired: { type: Boolean },
  taskType: { type: String } // "Sustainability", "Infrastructure", etc.
});

module.exports = mongoose.model("Organization", organizationSchema);
