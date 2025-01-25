// server/routes/matchingRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const matchingService = require("../services/matchingService");

/**
 * GET /api/matching/:volunteerId
 *  1) load volunteer (isVolunteer: true)
 *  2) load all requestors (isVolunteer: false)
 *  3) pass to matchingService => array of matched tasks
 *  4) group them into privateOrgs, requestorTasks, governmentOrgs
 *     by name-based logic, and include .address so the front-end can display it
 */
router.get("/:volunteerId", async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // 1) find volunteer
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found" });
    }
    if (!volunteer.isVolunteer) {
      return res.status(400).json({ error: "User is not a volunteer" });
    }

    // 2) find requestors
    const requestors = await User.find({ isVolunteer: false });
    if (!requestors.length) {
      return res.json({
        privateOrgs: [],
        requestorTasks: [],
        governmentOrgs: [],
      });
    }

    // 3) get all matched tasks from hugging-face approach
    const allMatchedTasks = await matchingService.findMatches(volunteer, requestors);
    /**
     * allMatchedTasks is an array of objects:
     *   {
     *     requestorId,
     *     requestorName,
     *     taskTitle,
     *     urgency,
     *     specialtyRequired,
     *     finalScore
     *   }
     * but we also want to pass .address
     */
    
    // We'll fetch each user's address so we can show it
    // in the final data. Alternatively, we could have matchingService
    // store it from the get-go, but let's do it here for clarity.
    const userMap = new Map();
    for (const r of requestors) {
      userMap.set(String(r._id), r);
    }

    // 4) separate final tasks into 3 arrays
    const privateOrgs = [];
    const requestorTasks = [];
    const governmentOrgs = [];

    for (const task of allMatchedTasks) {
      // find the user in userMap to get .address
      const userObj = userMap.get(String(task.requestorId));
      const address = userObj?.address || "No address provided";

      // create a final “match item” that includes the address
      const finalItem = {
        requestorId: task.requestorId,
        requestorName: task.requestorName,
        address,
        taskTitle: task.taskTitle,
        urgency: task.urgency,
        specialtyRequired: task.specialtyRequired,
        finalScore: task.finalScore,
      };

      // grouping logic
      const lowerName = task.requestorName.toLowerCase();
      if (
        lowerName.includes("fire") ||
        lowerName.includes("lafd") ||
        lowerName.includes("fema")
      ) {
        // Government
        governmentOrgs.push(finalItem);
      } else if (
        lowerName.includes("foundation") ||
        lowerName.includes("red cross") ||
        lowerName.includes("army") ||
        lowerName.includes("rubicon") ||
        lowerName.includes("team rubicon")
      ) {
        // Private organizations
        privateOrgs.push(finalItem);
      } else {
        // Everyone else => "Individual Requesters"
        requestorTasks.push(finalItem);
      }
    }

    return res.json({
      privateOrgs,
      requestorTasks,
      governmentOrgs,
    });
  } catch (error) {
    console.error("[matchingRoutes] Error in matching route:", error);
    return res.status(500).json({ error: "Error matching tasks" });
  }
});

module.exports = router;
