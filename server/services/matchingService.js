// server/services/matchingService.js

const axios = require("axios");

/**
 * This matching service uses the sentence-similarity pipeline at Hugging Face
 * plus a fallback word overlap if HF fails. It computes overlap via
 * (# of matching requestor slots) / (requestor's total slots).
 */
class MatchingService {
  constructor() {
    // Use the "sentence-similarity" pipeline for all-MiniLM-L6-v2
    this.API_URL =
      "https://api-inference.huggingface.co/pipeline/sentence-similarity/sentence-transformers/all-MiniLM-L6-v2";

    // Replace with your working HF API key
    this.API_KEY = "hf_YOUR_HF_API_KEY";
  }

  /**
   * 1) Attempt Hugging Face sentence-similarity pipeline
   * 2) If error => fallback to word overlap in [0.3..0.8]
   */
  async calculateTaskSimilarity(textA, textB) {
    console.log(
      `\n[calculateTaskSimilarity] Attempting sentence-similarity:\n  Volunteer Skill: "${textA}"\n  Requestor Task: "${textB}"\n`
    );

    try {
      const response = await axios.post(
        this.API_URL,
        {
          inputs: {
            source_sentence: textA,
            sentences: [textB],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Should get [similarity]
      const similarity = response.data[0];
      console.log(`[calculateTaskSimilarity] HF similarity => ${similarity.toFixed(3)}`);
      return similarity;
    } catch (error) {
      console.error(
        "[calculateTaskSimilarity] HF error => fallback word overlap.\n",
        error?.response?.data || error
      );
      const fallback = this.wordOverlapSimilarity(textA, textB);
      console.log(`[calculateTaskSimilarity] Fallback => ${fallback.toFixed(3)}`);
      return fallback;
    }
  }

  /**
   * Word overlap fallback: ratio in [0..1], scaled to [0.3..0.8].
   */
  wordOverlapSimilarity(a = "", b = "") {
    const setA = new Set(a.toLowerCase().split(/\s+/));
    const setB = new Set(b.toLowerCase().split(/\s+/));
    const common = [...setA].filter((w) => setB.has(w)).length;
    const total = new Set([...setA, ...setB]).size || 1;

    const overlapRatio = common / total; // [0..1]
    // scale to [0.3..0.8]
    return 0.3 + overlapRatio * 0.5;
  }

  /**
   * Weighted final:
   *  60% similarity
   *  25% urgency
   *  15% availability
   * If specialty is required but volunteer lacks => half final. 
   * Min final => 0.15 so we never get 0.
   */
  calculateMatchScore(similarity, urgency, availability, specialtyRequired, volunteerHasSpecialty) {
    // partial penalty if lacks specialty
    if (specialtyRequired && !volunteerHasSpecialty) {
      similarity *= 0.5;
    }

    let score =
      similarity * 0.6 +
      urgency * 0.25 +
      availability * 0.15;

    if (score < 0.15) score = 0.15;
    return score;
  }

  /**
   * Overlap = (# of matching day/time slots) / (requestor's total slots).
   */
  computeAvailabilityOverlap(volunteerAvail = {}, requestorAvail = {}) {
    let requestorSlotCount = 0;
    let matchCount = 0;

    // total requestor slots
    for (const day of Object.keys(requestorAvail)) {
      const reqSlots = requestorAvail[day] || [];
      requestorSlotCount += reqSlots.length;
    }

    if (requestorSlotCount === 0) return 0;

    // how many are also in volunteer's schedule
    for (const day of Object.keys(requestorAvail)) {
      const reqSlots = requestorAvail[day] || [];
      const volSlots = volunteerAvail[day] || [];

      for (const slot of reqSlots) {
        if (volSlots.includes(slot)) {
          matchCount++;
        }
      }
    }

    return matchCount / requestorSlotCount;
  }

  /**
   * findMatches() => For each requestor => each requested task => best among volunteer skills => push if > 0
   */
  async findMatches(volunteer, requestors) {
    console.log("[findMatches] Starting sentence-similarity matching.\n");

    // check if volunteer has "certified|professional|specialist"
    const volunteerHasSpecialty = volunteer.tasksWilling.some((skill) =>
      /certified|professional|specialist/i.test(skill.title)
    );

    const allMatches = [];
    let comparisonCount = 0;

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
          comparisonCount++;

          // 1) hugging face or fallback
          // eslint-disable-next-line no-await-in-loop
          const similarity = await this.calculateTaskSimilarity(volSkill.title, reqTask.title);

          // 2) Weighted final
          const finalScore = this.calculateMatchScore(
            similarity,
            urgencyVal,
            overlapVal,
            reqTask.specialtyRequired,
            volunteerHasSpecialty
          );

          console.log(
            `[compare #${comparisonCount}] VolunteerSkill="${volSkill.title}"  ReqTask="${reqTask.title}"\n` +
            `similarity=${similarity.toFixed(3)}  urgency=${urgencyVal.toFixed(2)}  overlap=${overlapVal.toFixed(2)} => finalScore=${finalScore.toFixed(3)}\n`
          );

          if (finalScore > bestScore) {
            bestScore = finalScore;
          }
        }

        // push final best for that requestor task
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

    console.log(`[findMatches] Completed. comparisons=${comparisonCount} => returning ${allMatches.length} tasks.\n`);

    // sort descending
    allMatches.sort((a, b) => b.finalScore - a.finalScore);
    return allMatches;
  }
}

module.exports = new MatchingService();
