// server/routes/orgRoutes.js
const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");

router.post("/seed", async (req, res) => {
  try {
    const orgs = [
      {
        name: "American Red Cross",
        link: "https://www.redcross.org/about-us/our-work/disaster-relief/wildfire-relief.html",
        address: "123 LA Road, Los Angeles, CA",
        urgencyLevel: 7,
        specialtyRequired: false,
        taskType: "Emergency Response",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Distribute Relief Supplies",
            urgency: 7,
            specialtyRequired: false,
            category: "Emergency Response",
          },
          {
            title: "Set Up Emergency Shelter",
            urgency: 8,
            specialtyRequired: true,
            category: "Emergency Response",
          },
        ],
        availability: {
          Monday: ["9am-12pm", "3pm-6pm"],
          Tuesday: ["6am-9am"],
          Friday: ["12pm-3pm", "3pm-6pm"],
        },
      },
      {
        name: "The Salvation Army",
        link: "https://www.salvationarmyusa.org/usn/wildfire-relief/",
        address: "305 Salvation St, Pasadena, CA",
        urgencyLevel: 6,
        specialtyRequired: false,
        taskType: "Emergency Response",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Operate Mobile Kitchen",
            urgency: 7,
            specialtyRequired: false,
            category: "Emergency Response",
          },
          {
            title: "Deliver Clothing Donations",
            urgency: 5,
            specialtyRequired: false,
            category: "Emergency Response",
          },
        ],
        availability: {
          Monday: ["3pm-6pm"],
          Wednesday: ["9am-12pm"],
          Sunday: ["6am-9am", "9am-12pm"],
        },
      },
      {
        name: "Team Rubicon",
        link: "https://teamrubiconusa.org/",
        address: "55 Rubicon Rd, Los Angeles, CA",
        urgencyLevel: 8,
        specialtyRequired: true,
        taskType: "Safety and Prevention",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Rebuild Damaged Structures",
            urgency: 9,
            specialtyRequired: true,
            category: "Infrastructure",
          },
          {
            title: "Run Debris Removal Operation",
            urgency: 8,
            specialtyRequired: true,
            category: "Safety and Prevention",
          },
        ],
        availability: {
          Tuesday: ["9am-12pm", "12pm-3pm"],
          Thursday: ["3pm-6pm"],
          Saturday: ["6pm-9pm"],
        },
      },
      {
        name: "Los Angeles Fire Department Foundation",
        link: "https://supportlafd.org/",
        address: "200 N Main St, Los Angeles, CA",
        urgencyLevel: 9,
        specialtyRequired: true,
        taskType: "Infrastructure",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Repair Station Equipment",
            urgency: 8,
            specialtyRequired: true,
            category: "Infrastructure",
          },
          {
            title: "Upgrade Communications Systems",
            urgency: 9,
            specialtyRequired: true,
            category: "Safety and Prevention",
          },
        ],
        availability: {
          Tuesday: ["3pm-6pm"],
          Friday: ["6am-9am", "9am-12pm"],
          Sunday: ["12pm-3pm"],
        },
      },
      {
        name: "NVFC FireCorps",
        link: "https://www.nvfc.org/programs/firecorps/",
        address: "Virtual / Nationwide",
        urgencyLevel: 3,
        specialtyRequired: false,
        taskType: "Volunteer Training",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Online Volunteer Coordination",
            urgency: 3,
            specialtyRequired: false,
            category: "Emergency Response",
          },
          {
            title: "Assist with FireCorps Webinars",
            urgency: 2,
            specialtyRequired: false,
            category: "Safety and Prevention",
          },
        ],
        availability: {
          Wednesday: ["12pm-3pm"],
          Thursday: ["9am-12pm"],
          Sunday: ["6am-9am", "9am-12pm"],
        },
      },
      {
        name: "FEMA CERT",
        link: "https://www.fema.gov/emergency-managers/individuals-communities/preparedness-activities-webinars/community-emergency-response-team",
        address: "Virtual / Nationwide",
        urgencyLevel: 4,
        specialtyRequired: false,
        taskType: "Community Response Team",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Community Emergency Drills",
            urgency: 6,
            specialtyRequired: false,
            category: "Emergency Response",
          },
          {
            title: "Disaster Preparedness Education",
            urgency: 5,
            specialtyRequired: false,
            category: "Safety and Prevention",
          },
        ],
        availability: {
          Tuesday: ["3pm-6pm"],
          Friday: ["9am-12pm"],
          Saturday: ["12pm-3pm", "3pm-6pm"],
        },
      },
      {
        name: "Ready.gov",
        link: "https://www.ready.gov/get-involved",
        address: "Virtual / Nationwide",
        urgencyLevel: 2,
        specialtyRequired: false,
        taskType: "Preparedness / Training",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Publish Preparedness Guides",
            urgency: 4,
            specialtyRequired: false,
            category: "Safety and Prevention",
          },
          {
            title: "Host Online Training Sessions",
            urgency: 3,
            specialtyRequired: false,
            category: "Emergency Response",
          },
        ],
        availability: {
          Monday: ["6am-9am", "9am-12pm"],
          Wednesday: ["3pm-6pm"],
          Sunday: ["6pm-9pm"],
        },
      },
      {
        name: "Make Me A Firefighter",
        link: "https://makemeafirefighter.org/",
        address: "Virtual / Nationwide",
        urgencyLevel: 4,
        specialtyRequired: true,
        taskType: "Firefighter Training",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Recruit Prospective Firefighters",
            urgency: 6,
            specialtyRequired: true,
            category: "Emergency Response",
          },
          {
            title: "Manage Fire Academy Contacts",
            urgency: 5,
            specialtyRequired: true,
            category: "Safety and Prevention",
          },
        ],
        availability: {
          Tuesday: ["9am-12pm"],
          Thursday: ["12pm-3pm", "3pm-6pm"],
          Saturday: ["9am-12pm"],
        },
      },
      {
        name: "Cal Volunteers Wildfire Recovery",
        link: "https://www.californiavolunteers.ca.gov/wildfire-recovery/",
        address: "Sacramento, CA",
        urgencyLevel: 8,
        specialtyRequired: false,
        taskType: "Sustainability",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
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
        availability: {
          Monday: ["6am-9am"],
          Tuesday: ["12pm-3pm", "3pm-6pm"],
          Friday: ["6pm-9pm"],
        },
      },
      {
        name: "LAFD Volunteer",
        link: "https://lafd.org/join/volunteer",
        address: "201 N Figueroa St, Los Angeles, CA",
        urgencyLevel: 8,
        specialtyRequired: true,
        taskType: "Community Education",

        // NEW FIELDS:
        isVolunteer: false,
        tasksWilling: [],
        tasksRequested: [
          {
            title: "Fire Safety Workshops",
            urgency: 6,
            specialtyRequired: false,
            category: "Safety and Prevention",
          },
          {
            title: "Install Home Smoke Alarms",
            urgency: 7,
            specialtyRequired: false,
            category: "Emergency Response",
          },
        ],
        availability: {
          Wednesday: ["6am-9am", "9am-12pm"],
          Thursday: ["3pm-6pm"],
          Sunday: ["9am-12pm"],
        },
      },
    ];

    // Clear existing orgs
    await Organization.deleteMany({});
    // Insert updated orgs
    await Organization.insertMany(orgs);

    res.json({ message: "Seeded organizations successfully with extended fields!" });
  } catch (error) {
    console.error("Error seeding organizations", error);
    res.status(500).json({ error: "Error seeding organizations" });
  }
});

// GET all orgs
router.get("/", async (req, res) => {
  try {
    const orgs = await Organization.find({});
    res.json(orgs);
  } catch (error) {
    console.error("Error getting orgs", error);
    res.status(500).json({ error: "Error getting orgs" });
  }
});

module.exports = router;
