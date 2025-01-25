// server/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Test route - PUT THIS FIRST
router.get("/ping", (req, res) => {
  return res.json({ message: "User routes are working" });
});

// Seed route to prepopulate users
router.post("/seed", async (req, res) => {
  try {
    const sampleUsers = [
      {
        name: "Alice Green",
        email: "alice@example.com",
        age: 29,
        address: "123 Elm St, Springfield",
        isVolunteer: true,
        availability: {
          Monday: ["6am-9am", "9am-12pm"],
          Wednesday: ["12pm-3pm"],
          Friday: ["6pm-9pm"],
        },
        tasksWilling: [
          { title: "Plant Trees" },
          { title: "Environmental Clean-Up" },
        ],
      },
      {
        name: "Bob Blue",
        email: "bob@example.com",
        age: 35,
        address: "456 Oak St, Springfield",
        isVolunteer: true,
        availability: {
          Tuesday: ["9am-12pm", "12pm-3pm"],
          Thursday: ["3pm-6pm"],
          Saturday: ["6pm-9pm"],
        },
        tasksWilling: [
          { title: "Debris Removal" },
          { title: "Rebuild Structures" },
        ],
      },
      {
        name: "Charlie Brown",
        email: "charlie@example.com",
        age: 42,
        address: "789 Maple St, Springfield",
        isVolunteer: false,
        availability: {
          Monday: ["9am-12pm", "3pm-6pm"],
          Thursday: ["12pm-3pm"],
          Saturday: ["9am-12pm"],
        },
        tasksRequested: [
          {
            title: "Set Up Emergency Shelter",
            urgency: 8,
            specialtyRequired: true,
            category: "Emergency Response",
          },
          {
            title: "Distribute Relief Supplies",
            urgency: 7,
            specialtyRequired: false,
            category: "Emergency Response",
          },
        ],
      },
      {
        name: "Diana Smith",
        email: "diana@example.com",
        age: 30,
        address: "321 Pine St, Springfield",
        isVolunteer: false,
        availability: {
          Tuesday: ["12pm-3pm", "3pm-6pm"],
          Friday: ["6pm-9pm"],
        },
        tasksRequested: [
          {
            title: "Coordinate Environmental Clean-Up",
            urgency: 7,
            specialtyRequired: false,
            category: "Sustainability",
          },
          {
            title: "Restore Forested Areas",
            urgency: 8,
            specialtyRequired: true,
            category: "Sustainability",
          },
        ],
      },
      {
        name: "Eve White",
        email: "eve@example.com",
        age: 27,
        address: "654 Cedar St, Springfield",
        isVolunteer: false,
        availability: {
          Wednesday: ["9am-12pm"],
          Sunday: ["6am-9am", "9am-12pm"],
        },
        tasksRequested: [
          {
            title: "Disaster Preparedness Education",
            urgency: 5,
            specialtyRequired: false,
            category: "Safety and Prevention",
          },
          {
            title: "Community Emergency Drills",
            urgency: 6,
            specialtyRequired: false,
            category: "Emergency Response",
          },
        ],
      },
    ];

    // Clear existing users and insert new ones
    await User.deleteMany({});
    const createdUsers = await User.insertMany(sampleUsers);

    res.status(201).json({ message: "Database seeded successfully!", users: createdUsers });
  } catch (error) {
    console.error("Error seeding database:", error);
    res.status(500).json({ error: "Error seeding database" });
  }
});

// Get all users - PUT THIS SECOND
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({})
      .select("name email isVolunteer")
      .lean();

    return res.json({
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    return res.status(500).json({ error: "Error getting all users", details: error.message });
  }
});

// Search for users
router.get("/search", async (req, res) => {
  try {
    const { term, type } = req.query;
    console.log("Search request received:", { term, type });

    // Create a case-insensitive search query for name
    const query = {
      $or: [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ],
      // If searching for requesters, isVolunteer should be false
      isVolunteer: type === "requester" ? false : true,
    };

    console.log("MongoDB query:", JSON.stringify(query, null, 2));

    const users = await User.find(query)
      .select("name email _id")
      .limit(10)
      .lean();

    console.log("Search results:", users);
    return res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      error: "Error searching users",
      details: error.message,
    });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, age, address, isVolunteer } = req.body;
    const user = new User({
      name,
      phone,
      email,
      age,
      address,
      isVolunteer,
    });
    await user.save();
    return res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Error creating user" });
  }
});

// Update user availability
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
    console.error("Error updating availability:", error);
    return res.status(500).json({ error: "Error updating availability" });
  }
});

// Update user tasks
router.put("/:userId/tasks", async (req, res) => {
  try {
    const { userId } = req.params;
    const { tasksRequested } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.tasksRequested.push(...tasksRequested);
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error("Error adding tasksRequested:", error);
    return res.status(500).json({ error: "Error adding tasksRequested" });
  }
});

// Update volunteer tasks
router.put("/:userId/tasksWilling", async (req, res) => {
  try {
    const { userId } = req.params;
    const { tasksWilling } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.tasksWilling.push(...tasksWilling);
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error("Error updating tasksWilling:", error);
    return res.status(500).json({ error: "Error updating tasksWilling" });
  }
});

// Get user by ID - PUT THIS LAST
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({ error: "Error getting user" });
  }
});

module.exports = router;
