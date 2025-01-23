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
// Add this route in server/routes/userRoutes.js

router.post("/seed", async (req, res) => {
  try {
    const users = [
      // Requesters
      {
        name: "Maria Rodriguez",
        phone: "123-555-0101",
        email: "maria.r@gmail.com",
        age: 52,
        address: "742 Palm Dr, Malibu, CA",
        isVolunteer: false,
        backgroundCheckStatus: "approved",
        tasksRequested: [
          {
            title: "Clear Debris from Property",
            urgency: 8,
            specialtyRequired: false,
            category: "Safety and Prevention"
          },
          {
            title: "Emergency Supply Distribution",
            urgency: 9,
            specialtyRequired: false,
            category: "Emergency Response"
          }
        ],
        availability: {
          Monday: ["9am-12pm"],
          Wednesday: ["3pm-6pm"],
          Friday: ["9am-12pm"]
        }
      },
      {
        name: "Tom Patterson",
        phone: "123-555-0202",
        email: "tomp@gmail.com",
        age: 67,
        address: "123 Highland Ave, Santa Barbara, CA",
        isVolunteer: false,
        backgroundCheckStatus: "approved",
        tasksRequested: [
          {
            title: "Tree Removal Assistance",
            urgency: 7,
            specialtyRequired: true,
            category: "Infrastructure"
          },
          {
            title: "Property Assessment",
            urgency: 6,
            specialtyRequired: true,
            category: "Safety and Prevention"
          }
        ],
        availability: {
          Tuesday: ["12pm-3pm"],
          Thursday: ["9am-12pm"],
          Saturday: ["3pm-6pm"]
        }
      },
      {
        name: "Linda Chang",
        phone: "123-555-0303",
        email: "lindac@gmail.com",
        age: 45,
        address: "567 Ocean View Rd, Ventura, CA",
        isVolunteer: false,
        backgroundCheckStatus: "approved",
        tasksRequested: [
          {
            title: "Replant Garden Area",
            urgency: 5,
            specialtyRequired: false,
            category: "Sustainability"
          },
          {
            title: "Install Fire-Resistant Plants",
            urgency: 6,
            specialtyRequired: true,
            category: "Sustainability"
          }
        ],
        availability: {
          Monday: ["6am-9am"],
          Wednesday: ["6am-9am"],
          Friday: ["6am-9am"]
        }
      },
      {
        name: "James Wilson",
        phone: "123-555-0404",
        email: "jwilson@gmail.com",
        age: 73,
        address: "890 Mountain View Dr, Ojai, CA",
        isVolunteer: false,
        backgroundCheckStatus: "approved",
        tasksRequested: [
          {
            title: "Smoke Alarm Installation",
            urgency: 8,
            specialtyRequired: false,
            category: "Safety and Prevention"
          },
          {
            title: "Emergency Planning Help",
            urgency: 7,
            specialtyRequired: false,
            category: "Emergency Response"
          }
        ],
        availability: {
          Tuesday: ["9am-12pm"],
          Thursday: ["9am-12pm"],
          Saturday: ["9am-12pm"]
        }
      },
      {
        name: "Susan Martinez",
        phone: "123-555-0505",
        email: "smartinez@gmail.com",
        age: 58,
        address: "432 Valley Rd, Thousand Oaks, CA",
        isVolunteer: false,
        backgroundCheckStatus: "pending",
        tasksRequested: [
          {
            title: "Water System Check",
            urgency: 9,
            specialtyRequired: true,
            category: "Infrastructure"
          },
          {
            title: "Emergency Generator Setup",
            urgency: 8,
            specialtyRequired: true,
            category: "Emergency Response"
          }
        ],
        availability: {
          Monday: ["3pm-6pm"],
          Wednesday: ["3pm-6pm"],
          Friday: ["3pm-6pm"]
        }
      },
      // Existing Volunteers
      {
        name: "Joe Smith",
        phone: "123-456-7890",
        email: "joesmith@gmail.com",
        age: 28,
        address: "123 Main St, Los Angeles, CA",
        isVolunteer: true,
        backgroundCheckStatus: "approved",
        tasksWilling: [
          {
            title: "Distribute Relief Supplies"
          },
          {
            title: "Set Up Emergency Shelter"
          }
        ],
        availability: {
          Monday: ["9am-12pm", "3pm-6pm"],
          Wednesday: ["6am-9am", "12pm-3pm"],
          Friday: ["9am-12pm"]
        }
      },
      {
        name: "Sarah Johnson",
        phone: "234-567-8901",
        email: "sarah.j@gmail.com",
        age: 35,
        address: "456 Oak Ave, Pasadena, CA",
        isVolunteer: true,
        backgroundCheckStatus: "approved",
        tasksWilling: [
          {
            title: "Operate Mobile Kitchen"
          },
          {
            title: "Community Emergency Drills"
          }
        ],
        availability: {
          Tuesday: ["6am-9am", "9am-12pm"],
          Thursday: ["3pm-6pm"],
          Saturday: ["12pm-3pm"]
        }
      },
      {
        name: "Mike Wilson",
        phone: "345-678-9012",
        email: "mikew@gmail.com",
        age: 42,
        address: "789 Pine St, Glendale, CA",
        isVolunteer: true,
        backgroundCheckStatus: "pending",
        tasksWilling: [
          {
            title: "Rebuild Damaged Structures"
          },
          {
            title: "Run Debris Removal Operation"
          }
        ],
        availability: {
          Monday: ["6am-9am"],
          Wednesday: ["9am-12pm"],
          Friday: ["3pm-6pm", "6pm-9pm"]
        }
      },
      {
        name: "Emily Chen",
        phone: "456-789-0123",
        email: "emilyc@gmail.com",
        age: 31,
        address: "321 Maple Dr, Burbank, CA",
        isVolunteer: true,
        backgroundCheckStatus: "approved",
        tasksWilling: [
          {
            title: "Restore Native Flora"
          },
          {
            title: "Replant Burned Areas"
          }
        ],
        availability: {
          Tuesday: ["9am-12pm", "12pm-3pm"],
          Thursday: ["6am-9am"],
          Saturday: ["9am-12pm", "3pm-6pm"]
        }
      },
      {
        name: "David Martinez",
        phone: "567-890-1234",
        email: "davidm@gmail.com",
        age: 39,
        address: "654 Cedar Ln, Long Beach, CA",
        isVolunteer: true,
        backgroundCheckStatus: "approved",
        tasksWilling: [
          {
            title: "Fire Safety Workshops"
          },
          {
            title: "Host Fire Safety Training"
          }
        ],
        availability: {
          Monday: ["12pm-3pm"],
          Wednesday: ["3pm-6pm"],
          Friday: ["9am-12pm", "12pm-3pm"]
        }
      },
      {
        name: "Lisa Thompson",
        phone: "678-901-2345",
        email: "lisat@gmail.com",
        age: 45,
        address: "987 Birch Rd, Santa Monica, CA",
        isVolunteer: true,
        backgroundCheckStatus: "pending",
        tasksWilling: [
          {
            title: "Smoke Alarm Installations"
          },
          {
            title: "Install Home Smoke Alarms"
          }
        ],
        availability: {
          Tuesday: ["6am-9am"],
          Thursday: ["12pm-3pm"],
          Sunday: ["9am-12pm", "3pm-6pm"]
        }
      },
      {
        name: "Robert Kim",
        phone: "789-012-3456",
        email: "robertk@gmail.com",
        age: 33,
        address: "147 Elm St, Culver City, CA",
        isVolunteer: true,
        backgroundCheckStatus: "approved",
        tasksWilling: [
          {
            title: "Online Volunteer Coordination"
          },
          {
            title: "Assist with FireCorps Webinars"
          }
        ],
        availability: {
          Monday: ["9am-12pm"],
          Wednesday: ["6pm-9pm"],
          Saturday: ["6am-9am", "9am-12pm"]
        }
      },
      {
        name: "Amanda Garcia",
        phone: "890-123-4567",
        email: "amandag@gmail.com",
        age: 29,
        address: "258 Walnut Ave, Sherman Oaks, CA",
        isVolunteer: true,
        backgroundCheckStatus: "approved",
        tasksWilling: [
          {
            title: "Coordinate Environmental Clean-Up"
          },
          {
            title: "Restore Forested Areas"
          }
        ],
        availability: {
          Tuesday: ["3pm-6pm"],
          Thursday: ["9am-12pm"],
          Sunday: ["12pm-3pm", "3pm-6pm"]
        }
      }
    ];

    // Clear existing users
    await User.deleteMany({});
    // Insert sample users
    await User.insertMany(users);

    res.json({ message: "Successfully seeded users collection!" });
  } catch (error) {
    console.error("Error seeding users", error);
    res.status(500).json({ error: "Error seeding users" });
  }
});
module.exports = router;
