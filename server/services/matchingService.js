const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

class MatchingService {
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async calculateTaskSimilarity(textA, textB) {
    console.log(
      `\n[calculateTaskSimilarity] Comparing:\n  A: "${textA}"\n  B: "${textB}"\n`
    );

    try {
      const prompt = `
Compare the following two task descriptions and provide a similarity score between 0 and 1, where 0 means completely different and 1 means identical. Only output the numerical score, nothing else.

Task A: "${textA}"
Task B: "${textB}"

Score:`;

      const response = await this.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a precise task matching assistant. Provide only numerical scores between 0 and 1." },
          { role: "user", content: prompt }
        ],
        max_tokens: 5,
        temperature: 0,
      });

      const similarity = parseFloat(response.data.choices[0].message.content.trim());

      if (isNaN(similarity) || similarity < 0 || similarity > 1) {
        console.warn(`[calculateTaskSimilarity] Invalid score from OpenAI: ${response.data.choices[0].message.content}. Using fallback.`);
        return this.wordOverlapSimilarity(textA, textB);
      }

      console.log(`[calculateTaskSimilarity] GPT similarity score: ${similarity.toFixed(3)}`);
      return similarity;

    } catch (error) {
      console.error(
        "[calculateTaskSimilarity] OpenAI error => using fallback.\n",
        error?.response?.data || error
      );
      const fallback = this.wordOverlapSimilarity(textA, textB);
      console.log(`[calculateTaskSimilarity] Fallback score: ${fallback.toFixed(3)}`);
      return fallback;
    }
  }

  wordOverlapSimilarity(a = "", b = "") {
    const setA = new Set(a.toLowerCase().split(/\s+/));
    const setB = new Set(b.toLowerCase().split(/\s+/));
    const common = [...setA].filter((w) => setB.has(w)).length;
    const total = new Set([...setA, ...setB]).size || 1;

    const overlapRatio = common / total;
    return 0.3 + overlapRatio * 0.5; // Scale to [0.3..0.8]
  }

  calculateMatchScore(similarity, urgency, availability, specialtyRequired, volunteerHasSpecialty) {
    if (specialtyRequired && !volunteerHasSpecialty) {
      similarity *= 0.5;
    }

    let score =
      similarity * 0.6 +    // 60% similarity
      urgency * 0.05 +      // 5% urgency
      availability * 0.35;   // 35% availability

    return Math.max(score, 0.15); // Minimum score of 0.15
  }

  computeAvailabilityOverlap(volunteerAvail = {}, requestorAvail = {}) {
    let requestorSlotCount = 0;
    let matchCount = 0;

    for (const day of Object.keys(requestorAvail)) {
      const reqSlots = requestorAvail[day] || [];
      requestorSlotCount += reqSlots.length;

      const volSlots = volunteerAvail[day] || [];
      for (const slot of reqSlots) {
        if (volSlots.includes(slot)) {
          matchCount++;
        }
      }
    }

    return requestorSlotCount === 0 ? 0 : matchCount / requestorSlotCount;
  }

  async findMatches(volunteer, requestors) {
    console.log("[findMatches] Starting volunteer-requestor matching");

    const volunteerHasSpecialty = volunteer.tasksWilling.some((skill) =>
      /certified|professional|specialist/i.test(skill.title)
    );

    const allMatches = [];

    for (const req of requestors) {
      const reqAvail = req.availability || {};

      for (const reqTask of req.tasksRequested || []) {
        const urgencyVal = (reqTask.urgency || 0) / 10;
        const overlapVal = this.computeAvailabilityOverlap(
          volunteer.availability,
          reqAvail
        );

        let bestScore = 0;

        for (const volSkill of volunteer.tasksWilling || []) {
          const similarity = await this.calculateTaskSimilarity(
            volSkill.title,
            reqTask.title
          );

          const finalScore = this.calculateMatchScore(
            similarity,
            urgencyVal,
            overlapVal,
            reqTask.specialtyRequired,
            volunteerHasSpecialty
          );

          if (finalScore > bestScore) {
            bestScore = finalScore;
          }
        }

        allMatches.push({
          requestorId: req._id,
          requestorName: req.name,
          address: req.address || "No address provided",
          taskTitle: reqTask.title,
          urgency: reqTask.urgency,
          specialtyRequired: reqTask.specialtyRequired,
          finalScore: bestScore,
        });
      }
    }

    return allMatches;
  }

  async findOrgMatches(volunteer, organizations) {
    console.log("[findOrgMatches] Starting organization matching");

    const volunteerHasSpecialty = volunteer.tasksWilling.some((skill) =>
      /certified|professional|specialist/i.test(skill.title)
    );

    const matchedOrgs = [];

    for (const org of organizations) {
      let bestOrgScore = 0;
      const reqAvail = org.availability || {};
      const overlapVal = this.computeAvailabilityOverlap(
        volunteer.availability,
        reqAvail
      );

      for (const orgTask of org.tasksRequested || []) {
        const urgencyVal = (orgTask.urgency || 0) / 10;

        for (const volSkill of volunteer.tasksWilling || []) {
          const similarity = await this.calculateTaskSimilarity(
            volSkill.title,
            orgTask.title
          );

          const finalScore = this.calculateMatchScore(
            similarity,
            urgencyVal,
            overlapVal,
            orgTask.specialtyRequired,
            volunteerHasSpecialty
          );

          if (finalScore > bestOrgScore) {
            bestOrgScore = finalScore;
          }
        }
      }

      if (bestOrgScore > 0) {
        matchedOrgs.push({
          ...org.toObject(),
          finalScore: bestOrgScore,
        });
      }
    }

    return matchedOrgs;
  }
}

module.exports = new MatchingService();