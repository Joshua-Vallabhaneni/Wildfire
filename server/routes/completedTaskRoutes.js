const express = require("express");
const router = express.Router();
const CompletedTask = require("../models/CompletedTask");

router.post("/", async (req, res) => {
  try {
    const completedTask = new CompletedTask(req.body);
    await completedTask.save();
    res.status(201).json(completedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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