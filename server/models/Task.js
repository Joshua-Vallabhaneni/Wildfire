// server/models/Task.js

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String },
  urgency: { type: Number },
  specialtyRequired: { type: Boolean },
  category: { type: String }, // e.g. "Sustainability", "Infrastructure", ...
  address: { type: String },
  // optional fields:
  status: { type: String, default: "open" }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
