// server/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");

// @route POST /api/users
// @desc  Create a new user (requester or volunteer)
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, age, address, isVolunteer } = req.body;

    const user = new User({
      name,
      phone,
      email,
      age,
      address,
      isVolunteer
    });
    await user.save();
    return res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user", error);
    return res.status(500).json({ error: "Error creating user" });
  }
});

// @route PUT /api/users/:userId/availability
// @desc  Update user availability (works for both requesters and volunteers)
router.put("/:userId/availability", async (req, res) => {
  try {
    const { userId } = req.params;
    const { availability } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { availability },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error updating availability", error);
    return res.status(500).json({ error: "Error updating availability" });
  }
});

// @route PUT /api/users/:userId/tasks
// @desc  Append tasks to a requester's tasksRequested array
router.put("/:userId/tasks", async (req, res) => {
  try {
    const { userId } = req.params;
    const { tasksRequested } = req.body; // array of tasks
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Append new tasks to tasksRequested
    user.tasksRequested.push(...tasksRequested);
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error("Error adding tasksRequested", error);
    return res.status(500).json({ error: "Error adding tasksRequested" });
  }
});

// @route PUT /api/users/:userId/tasksWilling
// @desc  Append tasks/skills to a volunteer's tasksWilling array
router.put("/:userId/tasksWilling", async (req, res) => {
  try {
    const { userId } = req.params;
    const { tasksWilling } = req.body; // array of tasks
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Append new tasks to tasksWilling
    user.tasksWilling.push(...tasksWilling);
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error("Error updating tasksWilling", error);
    return res.status(500).json({ error: "Error updating tasksWilling" });
  }
});

// @route GET /api/users/:userId
// @desc  Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error getting user", error);
    return res.status(500).json({ error: "Error getting user" });
  }
});

module.exports = router;
