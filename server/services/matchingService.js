// server/services/matchingService.js
const axios = require('axios');

class MatchingService {
  constructor() {
    this.API_URL = "https://api-inference.huggingface.co/models/deepseek-ai/deepseek-coder-1.3b-instruct";
    this.API_KEY = "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";
  }

  async calculateTaskSimilarity(task1, task2) {
    try {
      const prompt = `Given two tasks, assess their similarity on a scale from 0 to 1 where 1 is identical and 0 is completely different.
      Task 1: ${task1}
      Task 2: ${task2}
      Consider skills required, category of work, and overall purpose. Only respond with a number between 0 and 1.`;

      const response = await axios.post(
        this.API_URL,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const similarity = parseFloat(response.data[0].generated_text.trim());
      return isNaN(similarity) ? 0 : similarity;
    } catch (error) {
      console.error('Error calculating task similarity:', error);
      return 0;
    }
  }

  calculateMatchScore(similarity, task, volunteer) {
    const weights = {
      similarity: 0.5,
      urgency: 0.3,
      availability: 0.2
    };

    // Calculate similarity score
    const similarityScore = similarity;

    // Calculate urgency score (normalized to 0-1)
    const urgencyScore = task.urgency / 10;

    // Calculate availability match
    let availabilityScore = 0;
    if (volunteer.availability && task.requesterAvailability) {
      const commonDays = Object.keys(volunteer.availability).filter(day => 
        task.requesterAvailability[day]?.length > 0
      );

      const totalPossibleDays = 7; // Maximum possible matching days
      availabilityScore = commonDays.length / totalPossibleDays;
    }

    // Special handling for specialty requirements
    if (task.specialtyRequired) {
      // Check if volunteer has any specialty skills mentioned in their tasksWilling
      const hasSpecialty = volunteer.tasksWilling.some(skill => 
        skill.title.toLowerCase().includes('specialist') ||
        skill.title.toLowerCase().includes('certified') ||
        skill.title.toLowerCase().includes('professional')
      );
      
      if (!hasSpecialty) {
        return 0; // Immediately disqualify if specialty required but not present
      }
    }

    // Calculate final weighted score
    const finalScore = (
      similarityScore * weights.similarity +
      urgencyScore * weights.urgency +
      availabilityScore * weights.availability
    );

    return finalScore;
  }

  async findMatches(volunteer, allTasks, organizations) {
    const matches = {
      requestorTasks: [],
      privateOrgs: [],
      governmentOrgs: []
    };

    // Helper function to process tasks and calculate matches
    const processTaskMatches = async (tasks, source, maxMatches) => {
      const matchPromises = tasks.map(async (task) => {
        let highestScore = 0;
        
        for (const volunteerSkill of volunteer.tasksWilling) {
          const similarity = await this.calculateTaskSimilarity(
            volunteerSkill.title,
            task.title
          );

          const score = this.calculateMatchScore(similarity, task, volunteer);

          if (score > highestScore) {
            highestScore = score;
          }
        }

        return {
          ...task,
          source,
          matchScore: highestScore
        };
      });

      const results = await Promise.all(matchPromises);
      return results
        .filter(match => match.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxMatches);
    };

    // Process requestor tasks
    const requestorTasks = allTasks.filter(task => 
      !task.source.isVolunteer && task.tasksRequested
    ).flatMap(req => 
      req.tasksRequested.map(task => ({
        ...task,
        requesterAvailability: req.availability
      }))
    );
    matches.requestorTasks = await processTaskMatches(requestorTasks, 'requestor', 3);

    // Process organization tasks
    const privateOrgs = organizations.filter(org => !org.name.toLowerCase().includes('fire'));
    const governmentOrgs = organizations.filter(org => org.name.toLowerCase().includes('fire'));

    matches.privateOrgs = await processTaskMatches(
      privateOrgs.flatMap(org => org.tasksRequested.map(task => ({
        ...task,
        requesterAvailability: org.availability,
        organization: {
          name: org.name,
          address: org.address,
          link: org.link
        }
      }))),
      'private',
      3
    );

    matches.governmentOrgs = await processTaskMatches(
      governmentOrgs.flatMap(org => org.tasksRequested.map(task => ({
        ...task,
        requesterAvailability: org.availability,
        organization: {
          name: org.name,
          address: org.address,
          link: org.link
        }
      }))),
      'government',
      3
    );

    return matches;
  }
}

module.exports = new MatchingService();