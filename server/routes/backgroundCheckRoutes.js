// /server/routes/backgroundCheckRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/:userId/runBackgroundCheck", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Starting background check for user:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: "User not found",
        debugInfo: { error: "User ID not found in database" }
      });
    }

    // First, check just the name (most important)
    const nameQuery = `"${user.name}"`;
    const nameUrl = new URL("https://serpapi.com/search.json");
    nameUrl.searchParams.set("engine", "google");
    nameUrl.searchParams.set("q", nameQuery);
    nameUrl.searchParams.set("api_key", "8e32734fd0d5f8c6500d874f28f8cf60c11eacf6031113179341ba96025dcb9e");

    const nameResponse = await fetch(nameUrl);
    const nameData = await nameResponse.json();

    let debugInfo = {
      nameQuery: nameQuery,
      nameResults: nameData,
      resultsFound: {
        name: nameData?.organic_results?.length || 0,
        images: nameData?.inline_images?.length || 0
      },
      totalResults: nameData?.search_information?.total_results || 0,
      reasonForStatus: ""
    };

    // Define verification criteria
    const hasNamePresence = 
      (nameData?.organic_results?.length > 0) || 
      (nameData?.inline_images?.length > 0) ||
      (nameData?.search_information?.total_results > 0);

    let backgroundCheckStatus = "failed";
    
    if (hasNamePresence) {
      backgroundCheckStatus = "approved";
      debugInfo.reasonForStatus = `Found online presence: ${debugInfo.resultsFound.name} organic results and ${debugInfo.resultsFound.images} images`;
    } else {
      debugInfo.reasonForStatus = "No significant online presence found";
    }

    // Update user status
    user.backgroundCheckStatus = backgroundCheckStatus;
    await user.save();

    res.json({
      message: `Background check ${backgroundCheckStatus}`,
      backgroundCheckStatus,
      debugInfo
    });

  } catch (error) {
    console.error("Error in background check:", error);
    res.status(500).json({
      error: "Background check failed",
      debugInfo: {
        errorMessage: error.message,
        errorStack: error.stack
      }
    });
  }
});

module.exports = router;