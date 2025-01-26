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
    const categories = ["Community Emergency Drills", "Sustainability", "Emergency Response", "Infrastructure"];

    const tasksPerCategory = {
      "Community Emergency Drills": [
        { title: "Organize Community Fire Drill", urgency: 5, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Conduct Evacuation Simulation Exercise", urgency: 6, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Set Up Emergency Exit Signage", urgency: 4, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Train Volunteers for Fire Drill Roles", urgency: 7, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Evaluate Effectiveness of Recent Drills", urgency: 5, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Coordinate with Local Fire Departments for Drills", urgency: 8, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Develop New Protocols for Multi-Scenario Drills", urgency: 6, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Promote Participation in Upcoming Drills", urgency: 4, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Assess Community Readiness through Drills", urgency: 7, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Document Outcomes from Recent Fire Drills", urgency: 5, specialtyRequired: false, category: "Community Emergency Drills" },
      ],
      Sustainability: [
        { title: "Combat Deforestation in High-Risk Areas", urgency: 8, specialtyRequired: true, category: "Sustainability" },
        { title: "Restore Vegetation in Burned Forests", urgency: 6, specialtyRequired: true, category: "Sustainability" },
        { title: "Monitor Health of Local Forests", urgency: 5, specialtyRequired: true, category: "Sustainability" },
        { title: "Implement Controlled Burns to Manage Underbrush", urgency: 7, specialtyRequired: true, category: "Sustainability" },
        { title: "Educate Community on Fire Prevention Techniques", urgency: 6, specialtyRequired: false, category: "Sustainability" },
        { title: "Develop Sustainable Land Use Strategies", urgency: 8, specialtyRequired: true, category: "Sustainability" },
        { title: "Promote Recycling and Waste Reduction Initiatives", urgency: 5, specialtyRequired: false, category: "Sustainability" },
        { title: "Install and Maintain Firebreaks in Forested Areas", urgency: 7, specialtyRequired: true, category: "Sustainability" },
        { title: "Conduct Environmental Impact Studies Post-Wildfire", urgency: 6, specialtyRequired: true, category: "Sustainability" },
      ],
      "Emergency Response": [
        { title: "Set Up Emergency Shelters for Wildfire Evacuees", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
        { title: "Distribute Relief Supplies to Affected Areas", urgency: 7, specialtyRequired: false, category: "Emergency Response" },
        { title: "Coordinate Search and Rescue Missions", urgency: 9, specialtyRequired: true, category: "Emergency Response" },
        { title: "Provide Medical Assistance During Wildfires", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
        { title: "Manage Communication Systems in Emergencies", urgency: 7, specialtyRequired: true, category: "Emergency Response" },
        { title: "Conduct Damage Assessments After Wildfires", urgency: 6, specialtyRequired: true, category: "Emergency Response" },
        { title: "Organize Volunteer Rescue Teams", urgency: 8, specialtyRequired: false, category: "Emergency Response" },
        { title: "Ensure Safe Water Supply During Emergencies", urgency: 7, specialtyRequired: true, category: "Emergency Response" },
        { title: "Coordinate with Local Authorities for Emergency Response", urgency: 9, specialtyRequired: true, category: "Emergency Response" },
        { title: "Facilitate Evacuation Processes for Vulnerable Populations", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
      ],
      Infrastructure: [
        { title: "Rebuild Damaged Roads Post-Wildfire", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Repair Power Lines Affected by Wildfires", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
        { title: "Reconstruct Public Buildings Destroyed by Fires", urgency: 9, specialtyRequired: true, category: "Infrastructure" },
        { title: "Upgrade Water Supply Systems to Prevent Fire Hazards", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Install Emergency Lighting in Critical Areas", urgency: 6, specialtyRequired: false, category: "Infrastructure" },
        { title: "Maintain Communication Towers Post-Wildfire", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
        { title: "Reinforce Bridge Structures Vulnerable to Fires", urgency: 9, specialtyRequired: true, category: "Infrastructure" },
        { title: "Deploy Mobile Power Units in Affected Regions", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Set Up Temporary Shelters for Displaced Residents", urgency: 6, specialtyRequired: false, category: "Infrastructure" },
        { title: "Establish Mobile Health Clinics in Emergency Zones", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
      ],
    };

    const celebrityNames = [
      "Tom Hanks",
      "Emma Watson",
      "Dwayne Johnson",
      "Scarlett Johansson",
      "Chris Hemsworth",
      "Jennifer Lawrence",
      "Leonardo DiCaprio",
      "Gal Gadot",
      "Ryan Reynolds",
      "Zendaya",
      "Brad Pitt",
      "Margot Robbie",
      "Will Smith",
      "Natalie Portman",
      "Chris Evans",
      "Ariana Grande",
      "Henry Cavill",
      "Beyoncé Knowles",
      "Robert Downey Jr.",
      "Taylor Swift",
      "Jason Momoa",
      "Selena Gomez",
      "Keanu Reeves",
      "Lady Gaga",
      "Chris Pratt",
      "Rihanna Fenty",
      "Mark Ruffalo",
      "Katy Perry",
      "Jason Statham",
      "Adele Adkins",
      "Samuel L. Jackson",
      "Billie Eilish",
      "Justin Bieber",
      "Gal Gadot",
      "Chris Pine",
      "Kendall Jenner",
      "John Legend",
      "Zendaya",
      "Drake Graham",
      "Dua Lipa",
      "Timothée Chalamet",
    ];

    const generateRandomName = (index) => celebrityNames[index % celebrityNames.length];
    const generateRandomEmail = (index) => `requester${index + 1}@example.com`;
    const generateRandomAddress = (index) => `${100 + index} Celebrity Blvd, Springfield`;

    const sampleUsers = [
      // Existing Users
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
      // Generated Requester Users
    ];

    // Generate 40 Requester Users (10 per category)
    for (let i = 0; i < 40; i++) {
      const userIndex = i + 1;
      const categoryIndex = Math.floor(i / 10); // 0: Community Emergency Drills, 1: Sustainability, 2: Emergency Response, 3: Infrastructure
      const category = categories[categoryIndex];
      const tasks = tasksPerCategory[category];

      // Assign 1 or 2 tasks per user
      const numberOfTasks = i % 3 === 0 ? 2 : 1; // Approximately 1/3 have 2 tasks

      const userTasks = [];
      for (let j = 0; j < numberOfTasks; j++) {
        // Select a task ensuring similar but varied wording
        const task = tasks[j % tasks.length];
        userTasks.push({ ...task });
      }

      sampleUsers.push({
        name: generateRandomName(i),
        email: generateRandomEmail(i),
        age: 25 + (i % 15), // Ages between 25 and 39
        address: generateRandomAddress(i),
        isVolunteer: false,
        availability: {
          Monday: ["6am-9am", "9am-12pm"],
          Tuesday: ["12pm-3pm", "3pm-6pm"],
          Wednesday: ["9am-12pm"],
          Thursday: ["12pm-3pm"],
          Friday: ["6pm-9pm"],
          Saturday: ["9am-12pm", "6pm-9pm"],
          Sunday: ["6am-9am", "9am-12pm"],
        },
        tasksRequested: userTasks,
      });
    }

    // Leave room for one test case
    // Example:
    /*
    sampleUsers.push({
      name: "Test User",
      email: "testuser@example.com",
      age: 30,
      address: "999 Test St, Springfield",
      isVolunteer: false,
      availability: {
        Monday: ["9am-5pm"],
        Tuesday: ["9am-5pm"],
      },
      tasksRequested: [
        {
          title: "Test Task Title",
          urgency: 10,
          specialtyRequired: true,
          category: "Emergency Response",
        },
      ],
    });
    */

    // Insert sample users into the database
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

    // Create a case-insensitive search query for name and email
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
