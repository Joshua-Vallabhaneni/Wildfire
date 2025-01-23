// server/routes/matchingRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');
const matchingService = require('../services/matchingService');

// @route GET /api/matching/:volunteerId
// @desc Get matches for a volunteer
router.get('/:volunteerId', async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // Get volunteer
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || !volunteer.isVolunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Get all users and organizations
    const [allUsers, allOrgs] = await Promise.all([
      User.find({}),
      Organization.find({})
    ]);

    // Find matches using our matching service
    const matches = await matchingService.findMatches(
      volunteer,
      allUsers,
      allOrgs
    );

    res.json(matches);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Error finding matches' });
  }
});

module.exports = router;