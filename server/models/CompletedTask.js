const mongoose = require("mongoose");

const completedTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  taskTitle: { type: String, required: true },
  userId: String,
  category: { type: String, required: true },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verificationDoc: String,
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CompletedTask", completedTaskSchema);