// server/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");

// @route POST /api/users
// @desc  Create new user (either requester or volunteer)
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
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// @route PUT /api/users/:userId/availability
// @desc  Update user availability
router.put("/:userId/availability", async (req, res) => {
  try {
    const { userId } = req.params;
    const { availability } = req.body; // object of day -> array of times
    const user = await User.findByIdAndUpdate(
      userId,
      { availability },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    console.error("Error updating availability", error);
    res.status(500).json({ error: "Error updating availability" });
  }
});

// @route PUT /api/users/:userId/tasks
// @desc  Add tasks for a requester
router.put("/:userId/tasks", async (req, res) => {
  try {
    const { userId } = req.params;
    const { tasksRequested } = req.body; // array of tasks
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Just override or push? For simplicity, let's override.
    user.tasksRequested = tasksRequested;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error adding tasks", error);
    res.status(500).json({ error: "Error adding tasks" });
  }
});

// @route PUT /api/users/:userId/volunteerInterests
// @desc  Save volunteer's skill interests
router.put("/:userId/volunteerInterests", async (req, res) => {
  try {
    const { userId } = req.params;
    const { volunteerInterests } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { volunteerInterests },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    console.error("Error updating volunteer interests", error);
    res.status(500).json({ error: "Error updating volunteer interests" });
  }
});

// @route GET /api/users/:userId
// @desc  Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (error) {
    console.error("Error getting user", error);
    res.status(500).json({ error: "Error getting user" });
  }
});

module.exports = router;
