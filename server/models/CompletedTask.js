const mongoose = require("mongoose");

const completedTaskSchema = new mongoose.Schema({
  taskId: String,
  userId: String,
  category: String,
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verificationDoc: String,
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CompletedTask", completedTaskSchema);