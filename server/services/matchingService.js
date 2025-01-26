const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

class MatchingService {
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
    this.matchCache = new Map(); // Cache for storing matches
    this.similarityCache = new Map(); // Cache for storing similarity scores
    this.cacheTimeout = 60 * 1000; // 1 minute cache timeout
  }

  getCachedMatches(volunteerId) {
    const cached = this.matchCache.get(volunteerId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[getCachedMatches] Cache hit for volunteer ${volunteerId}`);
      return cached.data;
    }
    console.log(`[getCachedMatches] Cache miss for volunteer ${volunteerId}`);
    return null;
  }

  setCachedMatches(volunteerId, matches) {
    console.log(`[setCachedMatches] Caching matches for volunteer ${volunteerId}`);
    this.matchCache.set(volunteerId, {
      data: matches,
      timestamp: Date.now()
    });
  }

  async calculateTaskSimilarity(textA, textB) {
    const cacheKey = `${textA}|${textB}`;
    const cachedSimilarity = this.similarityCache.get(cacheKey);
    
    if (cachedSimilarity !== undefined) {
      console.log(`[calculateTaskSimilarity] Using cached similarity for "${textA}" and "${textB}"`);
      return cachedSimilarity;
    }

    console.log(`[calculateTaskSimilarity] Comparing:\n  A: "${textA}"\n  B: "${textB}"\n`);

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
        const fallback = this.wordOverlapSimilarity(textA, textB);
        this.similarityCache.set(cacheKey, fallback);
        return fallback;
      }

      console.log(`[calculateTaskSimilarity] GPT similarity score: ${similarity.toFixed(3)}`);
      this.similarityCache.set(cacheKey, similarity);
      return similarity;

    } catch (error) {
      console.error(
        "[calculateTaskSimilarity] OpenAI error => using fallback.\n",
        error?.response?.data || error
      );
      const fallback = this.wordOverlapSimilarity(textA, textB);
      this.similarityCache.set(cacheKey, fallback);
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
    // Check cache first
    const cachedMatches = this.getCachedMatches(volunteer._id);
    if (cachedMatches) {
      console.log(`[findMatches] Returning cached matches for volunteer ${volunteer._id}`);
      return cachedMatches;
    }

    console.log("[findMatches] Starting volunteer-requestor matching");

    const volunteerHasSpecialty = volunteer.tasksWilling.some((skill) =>
      /certified|professional|specialist/i.test(skill.title)
    );

    // Process requestors in parallel for better performance
    const matchPromises = requestors.map(async (req) => {
      const reqAvail = req.availability || {};
      const matches = [];

      for (const reqTask of req.tasksRequested || []) {
        const urgencyVal = (reqTask.urgency || 0) / 10;
        const overlapVal = this.computeAvailabilityOverlap(
          volunteer.availability,
          reqAvail
        );

        // Process volunteer skills in parallel
        const skillScores = await Promise.all(
          (volunteer.tasksWilling || []).map(async (volSkill) => {
            const similarity = await this.calculateTaskSimilarity(
              volSkill.title,
              reqTask.title
            );

            return this.calculateMatchScore(
              similarity,
              urgencyVal,
              overlapVal,
              reqTask.specialtyRequired,
              volunteerHasSpecialty
            );
          })
        );

        const bestScore = Math.max(...skillScores, 0);

        if (bestScore > 0) {
          matches.push({
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

      return matches;
    });

    const allMatchArrays = await Promise.all(matchPromises);
    const allMatches = allMatchArrays.flat();

    // Sort matches by score in descending order
    allMatches.sort((a, b) => b.finalScore - a.finalScore);

    // Cache the results
    this.setCachedMatches(volunteer._id, allMatches);
    return allMatches;
  }

  async findOrgMatches(volunteer, organizations) {
    // Check cache first
    const cacheKey = `${volunteer._id}_orgs`;
    const cachedMatches = this.getCachedMatches(cacheKey);
    if (cachedMatches) {
      console.log(`[findOrgMatches] Returning cached matches for volunteer ${volunteer._id}`);
      return cachedMatches;
    }

    console.log("[findOrgMatches] Starting organization matching");

    const volunteerHasSpecialty = volunteer.tasksWilling.some((skill) =>
      /certified|professional|specialist/i.test(skill.title)
    );

    // Process organizations in parallel
    const matchPromises = organizations.map(async (org) => {
      const reqAvail = org.availability || {};
      const overlapVal = this.computeAvailabilityOverlap(
        volunteer.availability,
        reqAvail
      );

      let bestOrgScore = 0;

      // Process organization tasks in parallel
      const taskScores = await Promise.all(
        (org.tasksRequested || []).map(async (orgTask) => {
          const urgencyVal = (orgTask.urgency || 0) / 10;

          // Process volunteer skills in parallel
          const skillScores = await Promise.all(
            (volunteer.tasksWilling || []).map(async (volSkill) => {
              const similarity = await this.calculateTaskSimilarity(
                volSkill.title,
                orgTask.title
              );

              return this.calculateMatchScore(
                similarity,
                urgencyVal,
                overlapVal,
                orgTask.specialtyRequired,
                volunteerHasSpecialty
              );
            })
          );

          return Math.max(...skillScores, 0);
        })
      );

      bestOrgScore = Math.max(...taskScores, 0);

      if (bestOrgScore > 0) {
        return {
          ...org.toObject(),
          finalScore: bestOrgScore,
        };
      }
      return null;
    });

    const matchedOrgs = (await Promise.all(matchPromises))
      .filter(Boolean)
      .sort((a, b) => b.finalScore - a.finalScore);

    // Cache the results
    this.setCachedMatches(cacheKey, matchedOrgs);
    return matchedOrgs;
  }

  clearCache(volunteerId) {
    if (volunteerId) {
      this.matchCache.delete(volunteerId);
      this.matchCache.delete(`${volunteerId}_orgs`);
      console.log(`[clearCache] Cleared cache for volunteer ${volunteerId}`);
    } else {
      this.matchCache.clear();
      this.similarityCache.clear();
      console.log('[clearCache] Cleared all caches');
    }
  }
}

module.exports = new MatchingService();