// server/routes/matchingRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");

// 1) IMPORTANT: bring in the matchingService
const matchingService = require("../services/matchingService");

/**
 * This route finds tasks requested by individuals and organizations,
 * computes a true match score by calling Hugging Face for each volunteer skill,
 * then returns the top matches for a given volunteer ID.
 */
router.get("/:volunteerId", async (req, res) => {
  try {
    console.log("Matching request received for volunteer:", req.params.volunteerId);

    // 2) Load the volunteer from MongoDB
    const volunteer = await User.findById(req.params.volunteerId);
    if (!volunteer) {
      console.log("Volunteer not found in database");
      return res.status(404).json({
        error: "Volunteer not found",
        providedId: req.params.volunteerId,
      });
    }
    if (!volunteer.isVolunteer) {
      console.log("User found but not a volunteer");
      return res.status(400).json({
        error: "User is not a volunteer",
        userId: req.params.volunteerId,
      });
    }

    // 3) Fetch all users (who are requesters) + all orgs, in parallel
    const [allUsers, allOrgs] = await Promise.all([
      User.find({ isVolunteer: false }),
      Organization.find({}),
    ]);

    console.log(`Found ${allUsers.length} requestors and ${allOrgs.length} organizations`);

    // 4) Build arrays of "tasks" from requesters and orgs
    //    Each item includes an extra 'requester' or 'organization' field
    const requestorTasks = allUsers.flatMap((user) =>
      user.tasksRequested.map((task) => ({
        ...task.toObject(),
        requester: {
          id: user._id,
          name: user.name,
        },
        requesterAvailability: user.availability,
      }))
    );

    const orgTasks = allOrgs.flatMap((org) =>
      org.tasksRequested.map((task) => ({
        ...task.toObject(),
        organization: {
          id: org._id,
          name: org.name,
          address: org.address,
          link: org.link,
        },
        requesterAvailability: org.availability,
      }))
    );

    // Split org tasks: "private" vs. "government"
    const privateOrgTasks = orgTasks.filter(
      (t) => !t.organization.name.toLowerCase().includes("fire")
    );
    const governmentOrgTasks = orgTasks.filter((t) =>
      t.organization.name.toLowerCase().includes("fire")
    );

    // 5) For each task, figure out the "best" match across volunteer's tasksWilling
    //    by calling Hugging Face to get a similarity for each skill, then computing
    //    a final weighted score with matchingService.calculateMatchScore
    async function getBestMatchScore(task) {
      let highest = 0;

      // If volunteer has no tasksWilling, skip
      if (!volunteer.tasksWilling || volunteer.tasksWilling.length === 0) {
        return 0;
      }

      for (const skillObj of volunteer.tasksWilling) {
        const skillText = skillObj.title || "";
        // 1) Call hugging face to get similarity in [0..1]
        const similarity = await matchingService.calculateTaskSimilarity(
          task.title,
          skillText
        );
        // 2) Then compute the final match score (similarity + urgency + availability, etc.)
        const currentScore = matchingService.calculateMatchScore(
          similarity,
          task,
          volunteer
        );
        if (currentScore > highest) {
          highest = currentScore;
        }
      }

      return highest; // best match for that task
    }

    // 6) process a list of tasks => assign matchScore => filter => sort => top 3
    async function processTasks(taskArray) {
      const results = await Promise.all(
        taskArray.map(async (task) => {
          const matchScore = await getBestMatchScore(task);
          return { ...task, matchScore };
        })
      );

      return results
        .filter((item) => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
    }

    // 7) run the process for requestors, private orgs, and gov orgs
    const scoredRequestorTasks = await processTasks(requestorTasks);
    const scoredPrivateOrgs = await processTasks(privateOrgTasks);
    const scoredGovernmentOrgs = await processTasks(governmentOrgTasks);

    console.log("Match counts:", {
      requestors: scoredRequestorTasks.length,
      private: scoredPrivateOrgs.length,
      government: scoredGovernmentOrgs.length,
    });

    // 8) Return the final matched tasks to the frontend
    return res.json({
      requestorTasks: scoredRequestorTasks,
      privateOrgs: scoredPrivateOrgs,
      governmentOrgs: scoredGovernmentOrgs,
    });
  } catch (error) {
    console.error("Detailed matching error:", {
      message: error.message,
      stack: error.stack,
      volunteerId: req.params.volunteerId,
    });

    return res.status(500).json({
      error: "Error finding matches",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
