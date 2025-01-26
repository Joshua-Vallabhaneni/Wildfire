const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const matchingService = require("../services/matchingService");

router.get("/:volunteerId", async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // 1) Find volunteer
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found" });
    }
    if (!volunteer.isVolunteer) {
      return res.status(400).json({ error: "User is not a volunteer" });
    }

    // 2) Find requestors
    const requestors = await User.find({ isVolunteer: false });
    if (requestors.length === 0) {
      return res.json({
        privateOrgs: [],
        requestorTasks: [],
        governmentOrgs: [],
      });
    }

    // 3) Get all matched tasks from matching service
    const allMatchedTasks = await matchingService.findMatches(volunteer, requestors);

    // 4) Find all organizations
    const organizations = await Organization.find({});
    const matchedOrgs = await matchingService.findOrgMatches(volunteer, organizations);

    // 5) Separate organizations based on name patterns
    const privateOrgs = [];
    const governmentOrgs = [];

    for (const org of matchedOrgs) {
      const lowerName = org.name.toLowerCase();
      if (
        lowerName.includes("fire") ||
        lowerName.includes("lafd") ||
        lowerName.includes("fema") ||
        lowerName.includes("cert") ||
        lowerName.includes(".gov")
      ) {
        governmentOrgs.push(org);
      } else {
        privateOrgs.push(org);
      }
    }

    // 6) Sort each category by finalScore and take top 3
    const sortAndSlice = (arr) =>
      arr.sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);

    const response = {
      privateOrgs: sortAndSlice(privateOrgs),
      requestorTasks: sortAndSlice(allMatchedTasks),
      governmentOrgs: sortAndSlice(governmentOrgs),
    };

    console.log("Sending matched results:", {
      privateOrgsCount: response.privateOrgs.length,
      requestorTasksCount: response.requestorTasks.length,
      governmentOrgsCount: response.governmentOrgs.length,
    });

    return res.json(response);
  } catch (error) {
    console.error("[matchingRoutes] Error in matching route:", error);
    return res.status(500).json({ error: "Error matching tasks" });
  }
});

module.exports = router;