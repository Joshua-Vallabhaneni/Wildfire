// server/routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// @route POST /api/tasks
// @desc  Create a new task (if you separate tasks from user)
router.post("/", async (req, res) => {
  try {
    const { requesterId, title, urgency, specialtyRequired, category, address } = req.body;
    const task = new Task({
      requesterId,
      title,
      urgency,
      specialtyRequired,
      category,
      address
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task", error);
    res.status(500).json({ error: "Error creating task" });
  }
});

// @route GET /api/tasks
// @desc  Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (error) {
    console.error("Error getting tasks", error);
    res.status(500).json({ error: "Error getting tasks" });
  }
});

// Additional routes to filter, update, delete tasks if needed

module.exports = router;
