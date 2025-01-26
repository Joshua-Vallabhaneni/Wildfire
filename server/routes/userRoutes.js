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
        { title: "Organize Fire Drill", urgency: 5, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Conduct Evacuation Simulation", urgency: 6, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Set Up Emergency Signage", urgency: 4, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Train Volunteers for Drills", urgency: 7, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Evaluate Drill Effectiveness", urgency: 5, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Coordinate with Local Fire Departments", urgency: 8, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Develop Drill Protocols", urgency: 6, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Promote Participation in Drills", urgency: 4, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Assess Community Readiness", urgency: 7, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Document Drill Outcomes", urgency: 5, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Plan Multi-Scenario Drills", urgency: 6, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Facilitate Feedback Sessions", urgency: 4, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Update Drill Materials", urgency: 5, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Schedule Regular Drills", urgency: 7, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Integrate Technology in Drills", urgency: 6, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Coordinate Transportation for Drills", urgency: 4, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Ensure Accessibility During Drills", urgency: 5, specialtyRequired: false, category: "Community Emergency Drills" },
        { title: "Manage Drill Resources", urgency: 6, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Collaborate with Schools for Drills", urgency: 7, specialtyRequired: true, category: "Community Emergency Drills" },
        { title: "Analyze Drill Data", urgency: 5, specialtyRequired: true, category: "Community Emergency Drills" },
      ],
      Sustainability: [
        { title: "Plant Fire-Resistant Trees", urgency: 7, specialtyRequired: false, category: "Sustainability" },
        { title: "Fight Deforestation Efforts", urgency: 8, specialtyRequired: true, category: "Sustainability" },
        { title: "Restore Burned Areas", urgency: 6, specialtyRequired: true, category: "Sustainability" },
        { title: "Monitor Forest Health", urgency: 5, specialtyRequired: true, category: "Sustainability" },
        { title: "Implement Controlled Burns", urgency: 7, specialtyRequired: true, category: "Sustainability" },
        { title: "Educate Community on Fire Prevention", urgency: 6, specialtyRequired: false, category: "Sustainability" },
        { title: "Develop Sustainable Land Use Plans", urgency: 8, specialtyRequired: true, category: "Sustainability" },
        { title: "Promote Recycling Initiatives", urgency: 5, specialtyRequired: false, category: "Sustainability" },
        { title: "Install Firebreaks", urgency: 7, specialtyRequired: true, category: "Sustainability" },
        { title: "Conduct Environmental Impact Assessments", urgency: 6, specialtyRequired: true, category: "Sustainability" },
        { title: "Coordinate Reforestation Projects", urgency: 8, specialtyRequired: true, category: "Sustainability" },
        { title: "Manage Sustainable Resources", urgency: 5, specialtyRequired: false, category: "Sustainability" },
        { title: "Develop Green Infrastructure", urgency: 7, specialtyRequired: true, category: "Sustainability" },
        { title: "Promote Wildlife Conservation", urgency: 6, specialtyRequired: false, category: "Sustainability" },
        { title: "Reduce Carbon Footprint Initiatives", urgency: 8, specialtyRequired: true, category: "Sustainability" },
        { title: "Implement Water Conservation Programs", urgency: 5, specialtyRequired: false, category: "Sustainability" },
        { title: "Support Renewable Energy Projects", urgency: 7, specialtyRequired: true, category: "Sustainability" },
        { title: "Facilitate Community Clean-Up Drives", urgency: 6, specialtyRequired: false, category: "Sustainability" },
        { title: "Monitor Air Quality", urgency: 5, specialtyRequired: true, category: "Sustainability" },
        { title: "Develop Sustainable Agriculture Practices", urgency: 8, specialtyRequired: true, category: "Sustainability" },
      ],
      "Emergency Response": [
        { title: "Set Up Emergency Shelters", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
        { title: "Distribute Relief Supplies", urgency: 7, specialtyRequired: false, category: "Emergency Response" },
        { title: "Coordinate Search and Rescue Operations", urgency: 9, specialtyRequired: true, category: "Emergency Response" },
        { title: "Provide Medical Assistance", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
        { title: "Manage Emergency Communication Systems", urgency: 7, specialtyRequired: true, category: "Emergency Response" },
        { title: "Conduct Damage Assessments", urgency: 6, specialtyRequired: true, category: "Emergency Response" },
        { title: "Organize Volunteer Teams for Rescue", urgency: 8, specialtyRequired: false, category: "Emergency Response" },
        { title: "Ensure Safe Water Supply in Emergencies", urgency: 7, specialtyRequired: true, category: "Emergency Response" },
        { title: "Coordinate with Local Authorities", urgency: 9, specialtyRequired: true, category: "Emergency Response" },
        { title: "Facilitate Evacuation Processes", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
        { title: "Provide Psychological Support to Affected Individuals", urgency: 6, specialtyRequired: true, category: "Emergency Response" },
        { title: "Set Up Temporary Housing Facilities", urgency: 7, specialtyRequired: true, category: "Emergency Response" },
        { title: "Manage Logistics for Emergency Supplies", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
        { title: "Implement Fire Suppression Techniques", urgency: 9, specialtyRequired: true, category: "Emergency Response" },
        { title: "Monitor Weather Conditions for Emergencies", urgency: 5, specialtyRequired: true, category: "Emergency Response" },
        { title: "Coordinate Transportation for Evacuees", urgency: 7, specialtyRequired: false, category: "Emergency Response" },
        { title: "Set Up Emergency Power Systems", urgency: 6, specialtyRequired: true, category: "Emergency Response" },
        { title: "Facilitate Community Recovery Efforts", urgency: 5, specialtyRequired: false, category: "Emergency Response" },
        { title: "Provide Training for Emergency Responders", urgency: 7, specialtyRequired: true, category: "Emergency Response" },
        { title: "Develop Emergency Response Plans", urgency: 8, specialtyRequired: true, category: "Emergency Response" },
      ],
      Infrastructure: [
        { title: "Rebuild Damaged Roads", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Repair Power Lines", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
        { title: "Reconstruct Public Buildings", urgency: 9, specialtyRequired: true, category: "Infrastructure" },
        { title: "Upgrade Water Supply Systems", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Install Emergency Lighting", urgency: 6, specialtyRequired: false, category: "Infrastructure" },
        { title: "Maintain Communication Towers", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
        { title: "Reinforce Bridge Structures", urgency: 9, specialtyRequired: true, category: "Infrastructure" },
        { title: "Deploy Mobile Power Units", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Set Up Temporary Shelters", urgency: 6, specialtyRequired: false, category: "Infrastructure" },
        { title: "Establish Mobile Health Clinics", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
        { title: "Implement Flood Barriers", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Restore Transportation Networks", urgency: 9, specialtyRequired: true, category: "Infrastructure" },
        { title: "Build Emergency Access Roads", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
        { title: "Maintain Sewage Treatment Plants", urgency: 6, specialtyRequired: true, category: "Infrastructure" },
        { title: "Upgrade Electrical Grid Systems", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Install Temporary Housing Units", urgency: 5, specialtyRequired: false, category: "Infrastructure" },
        { title: "Develop Resilient Infrastructure Plans", urgency: 8, specialtyRequired: true, category: "Infrastructure" },
        { title: "Repair Public Transportation Systems", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
        { title: "Set Up Emergency Water Purification Systems", urgency: 6, specialtyRequired: true, category: "Infrastructure" },
        { title: "Monitor Structural Integrity of Buildings", urgency: 7, specialtyRequired: true, category: "Infrastructure" },
      ],
    };

    const generateRandomName = (index) => `Requester User ${index + 1}`;
    const generateRandomEmail = (index) => `requester${index + 1}@example.com`;
    const generateRandomAddress = (index) => `${100 + index} Sample St, Springfield`;

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

    // Generate 80 Requester Users
    for (let i = 0; i < 80; i++) {
      const userIndex = i + 1;
      const categoryIndex = Math.floor(i / 20); // 0: Community Emergency Drills, 1: Sustainability, 2: Emergency Response, 3: Infrastructure
      const category = categories[categoryIndex];
      const tasks = tasksPerCategory[category];
      
      // Assign 1 or 2 tasks per user
      const numberOfTasks = Math.random() < 0.7 ? 1 : 2; // 70% have 1 task, 30% have 2 tasks
      
      const userTasks = [];
      for (let j = 0; j < numberOfTasks; j++) {
        // Select a random task from the category
        const task = tasks[Math.floor(Math.random() * tasks.length)];
        userTasks.push(task);
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
