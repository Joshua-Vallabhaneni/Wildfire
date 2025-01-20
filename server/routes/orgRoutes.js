// server/routes/orgRoutes.js

const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");

// Fake data seeding endpoint (to insert some organizations)
router.post("/seed", async (req, res) => {
  try {
    const orgs = [
      {
        name: "Red Cross LA",
        link: "http://redcross.org/la",
        address: "123 LA Road, Los Angeles, CA",
        urgencyLevel: 7,
        specialtyRequired: false,
        taskType: "Emergency Response"
      },
      {
        name: "CalFire Support",
        link: "http://calfire.ca.gov",
        address: "456 Fire Lane, Los Angeles, CA",
        urgencyLevel: 9,
        specialtyRequired: true,
        taskType: "Safety and Prevention"
      }
      // ... add as many as you want
    ];

    await Organization.insertMany(orgs);
    res.json({ message: "Seeded organizations" });
  } catch (error) {
    console.error("Error seeding organizations", error);
    res.status(500).json({ error: "Error seeding organizations" });
  }
});

// @route GET /api/orgs
// @desc  Get all organizations (for the volunteer dashboard)
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
