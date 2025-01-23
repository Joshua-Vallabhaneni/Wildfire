const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/:userId/runBackgroundCheck", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Simple search query with the user's name
    const searchUrl = new URL("https://serpapi.com/search.json");
    searchUrl.searchParams.set("engine", "google");
    searchUrl.searchParams.set("q", `"${user.name}"`);
    searchUrl.searchParams.set("num", "10");
    searchUrl.searchParams.set("api_key", process.env.SERP_API_KEY);

    const response = await fetch(searchUrl);
    const data = await response.json();

    const organicResults = data.organic_results || [];
    const hasResults = organicResults.length > 0;

    const trustedDomains = [
      'linkedin.com',
      'facebook.com',
      'github.com',
      '.edu',
      '.gov',
      'twitter.com',
      'instagram.com'
    ];

    const hasTrustedPresence = organicResults.some(result => 
      trustedDomains.some(domain => result.link?.toLowerCase().includes(domain))
    );

    const backgroundCheckStatus = (hasResults && hasTrustedPresence) ? "approved" : "failed";

    user.backgroundCheckStatus = backgroundCheckStatus;
    await user.save();

    // Updated response structure
    res.json({
      backgroundCheckStatus,
      debugInfo: {
        nameResults: {
          resultsFound: organicResults.length,
          hasTrustedPresence
        },
        nameQuery: user.name,
        totalResults: organicResults.length,
        reasonForStatus: hasTrustedPresence 
          ? "Verified presence on trusted platforms" 
          : "Insufficient online presence"
      }
    });

  } catch (error) {
    console.error("Error in background check:", error);
    res.status(500).json({ error: "Background check failed" });
  }
});

module.exports = router;