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

router.get("/", async (req, res) => {
  try {
    const completedTasks = await CompletedTask.find();
    res.json(completedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;