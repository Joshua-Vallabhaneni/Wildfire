// server/routes/matchingRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');

router.get('/:volunteerId', async (req, res) => {
  try {
    console.log('Matching request received for volunteer:', req.params.volunteerId);
    
    // Get volunteer
    const volunteer = await User.findById(req.params.volunteerId);
    console.log('Volunteer found:', volunteer ? 'Yes' : 'No');
    
    if (!volunteer) {
      console.log('Volunteer not found in database');
      return res.status(404).json({ 
        error: 'Volunteer not found',
        providedId: req.params.volunteerId
      });
    }

    if (!volunteer.isVolunteer) {
      console.log('User found but not a volunteer');
      return res.status(400).json({ 
        error: 'User is not a volunteer',
        userId: req.params.volunteerId
      });
    }

    // Get all users (for requestors) and organizations
    const [allUsers, allOrgs] = await Promise.all([
      User.find({ isVolunteer: false }),
      Organization.find({})
    ]);
    
    console.log(`Found ${allUsers.length} requestors and ${allOrgs.length} organizations`);

    // Process requestor tasks
    const requestorTasks = allUsers.flatMap(user => 
      user.tasksRequested.map(task => ({
        ...task.toObject(),
        requester: {
          id: user._id,
          name: user.name
        },
        requesterAvailability: user.availability
      }))
    );

    // Process organization tasks
    const orgTasks = allOrgs.flatMap(org => 
      org.tasksRequested.map(task => ({
        ...task.toObject(),
        organization: {
          id: org._id,
          name: org.name,
          address: org.address,
          link: org.link
        },
        requesterAvailability: org.availability
      }))
    );

    // Split org tasks into private and government
    const privateOrgs = orgTasks.filter(task => 
      !task.organization.name.toLowerCase().includes('fire')
    );
    const governmentOrgs = orgTasks.filter(task => 
      task.organization.name.toLowerCase().includes('fire')
    );

    // Calculate basic match scores (you can enhance this logic)
    const calculateMatchScore = (task, volunteerSkills) => {
      let score = 0;
      for (const skill of volunteerSkills) {
        // Simple text matching for now
        if (task.title.toLowerCase().includes(skill.title.toLowerCase())) {
          score += 1;
        }
      }
      return score / volunteerSkills.length; // Normalize to 0-1
    };

    // Add match scores
    const scoredRequestorTasks = requestorTasks
      .map(task => ({
        ...task,
        matchScore: calculateMatchScore(task, volunteer.tasksWilling)
      }))
      .filter(task => task.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    const scoredPrivateOrgs = privateOrgs
      .map(task => ({
        ...task,
        matchScore: calculateMatchScore(task, volunteer.tasksWilling)
      }))
      .filter(task => task.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    const scoredGovernmentOrgs = governmentOrgs
      .map(task => ({
        ...task,
        matchScore: calculateMatchScore(task, volunteer.tasksWilling)
      }))
      .filter(task => task.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    console.log('Match counts:', {
      requestors: scoredRequestorTasks.length,
      private: scoredPrivateOrgs.length,
      government: scoredGovernmentOrgs.length
    });

    res.json({
      requestorTasks: scoredRequestorTasks,
      privateOrgs: scoredPrivateOrgs,
      governmentOrgs: scoredGovernmentOrgs
    });

  } catch (error) {
    console.error('Detailed matching error:', {
      message: error.message,
      stack: error.stack,
      volunteerId: req.params.volunteerId
    });
    
    res.status(500).json({ 
      error: 'Error finding matches',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;