// server/routes/orgRoutes.js
const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");

// Example: Replace or expand your existing seeding data here
router.post("/seed", async (req, res) => {
  try {
    const orgs = [
      {
        name: "American Red Cross",
        link: "https://www.redcross.org/about-us/our-work/disaster-relief/wildfire-relief.html",
        address: "123 LA Road, Los Angeles, CA",
        urgencyLevel: 7,
        specialtyRequired: false,
        taskType: "Emergency Response"
      },
      {
        name: "The Salvation Army",
        link: "https://www.salvationarmyusa.org/usn/wildfire-relief/",
        address: "305 Salvation St, Pasadena, CA",
        urgencyLevel: 6,
        specialtyRequired: false,
        taskType: "Emergency Response"
      },
      {
        name: "Team Rubicon",
        link: "https://teamrubiconusa.org/",
        address: "55 Rubicon Rd, Los Angeles, CA",
        urgencyLevel: 8,
        specialtyRequired: true,
        taskType: "Safety and Prevention"
      },
      {
        name: "Maui Cultural Lands",
        link: "https://time.com/6992318/maui-cultural-lands/",
        address: "100 Honoapiilani Hwy, Lahaina, HI",
        urgencyLevel: 9,
        specialtyRequired: true,
        taskType: "Habitat Restoration"
      },
      {
        name: "Los Angeles Fire Department Foundation",
        link: "https://supportlafd.org/",
        address: "200 N Main St, Los Angeles, CA",
        urgencyLevel: 9,
        specialtyRequired: true,
        taskType: "Infrastructure"
      },
      {
        name: "Rockville Volunteer Fire Department (RVFD)",
        link: "https://rvfd.org/volunteer/",
        address: "380 Hungerford Dr, Rockville, MD",
        urgencyLevel: 5,
        specialtyRequired: false,
        taskType: "Emergency Response"
      },
      {
        name: "Montgomery County Volunteer Fire-Rescue Association (MCVFRA)",
        link: "https://www.mocofirerescue.org/",
        address: "101 Monroe St, Rockville, MD",
        urgencyLevel: 6,
        specialtyRequired: false,
        taskType: "Safety and Prevention"
      },
      // Government/Training-specific references:
      {
        name: "NVFC FireCorps",
        link: "https://www.nvfc.org/programs/firecorps/",
        address: "Virtual / Nationwide",
        urgencyLevel: 3,
        specialtyRequired: false,
        taskType: "Volunteer Training"
      },
      {
        name: "FEMA CERT",
        link: "https://www.fema.gov/emergency-managers/individuals-communities/preparedness-activities-webinars/community-emergency-response-team",
        address: "Virtual / Nationwide",
        urgencyLevel: 4,
        specialtyRequired: false,
        taskType: "Community Response Team"
      },
      {
        name: "Ready.gov",
        link: "https://www.ready.gov/get-involved",
        address: "Virtual / Nationwide",
        urgencyLevel: 2,
        specialtyRequired: false,
        taskType: "Preparedness / Training"
      },
      {
        name: "Make Me A Firefighter",
        link: "https://makemeafirefighter.org/",
        address: "Virtual / Nationwide",
        urgencyLevel: 4,
        specialtyRequired: true,
        taskType: "Firefighter Training"
      },
      {
        name: "Cal Volunteers Wildfire Recovery",
        link: "https://www.californiavolunteers.ca.gov/wildfire-recovery/",
        address: "Sacramento, CA",
        urgencyLevel: 8,
        specialtyRequired: false,
        taskType: "Sustainability"
      },
      {
        name: "LAFD Volunteer",
        link: "https://lafd.org/join/volunteer",
        address: "201 N Figueroa St, Los Angeles, CA",
        urgencyLevel: 8,
        specialtyRequired: true,
        taskType: "Community Education"
      },
      // ...Add as many as you like
    ];

    // Clear existing orgs or not, depending on your preference
    await Organization.deleteMany({});
    await Organization.insertMany(orgs);
    res.json({ message: "Seeded organizations successfully!" });
  } catch (error) {
    console.error("Error seeding organizations", error);
    res.status(500).json({ error: "Error seeding organizations" });
  }
});

// GET all orgs (already in your code)
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
