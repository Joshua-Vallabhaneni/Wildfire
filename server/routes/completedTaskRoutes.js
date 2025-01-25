const express = require("express");
const router = express.Router();
const CompletedTask = require("../models/CompletedTask");

// Get all completed tasks
router.get("/", async (req, res) => {
  try {
    const completedTasks = await CompletedTask.find();
    res.json(completedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new completed task
router.post("/", async (req, res) => {
  try {
    const completedTask = new CompletedTask(req.body);
    await completedTask.save();
    
    // Get updated list of completed tasks
    const updatedTasks = await CompletedTask.find();
    
    res.status(201).json({
      completedTask,
      allCompletedTasks: updatedTasks
    });
  } catch (error) {
    console.error("Error creating completed task:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get completed tasks by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const completedTasks = await CompletedTask.find({
      completedBy: req.params.userId
    });
    res.json(completedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get completed tasks by category
router.get("/category/:category", async (req, res) => {
  try {
    const tasks = await CompletedTask.find({
      category: req.params.category
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;