const User = require('../models/User');
const Booking = require('../models/Booking');
const Office = require('../models/Office');

/**
 * Suggest the best office for a user based on their history, cancellations, and office availability.
 * @param {string} userId
 * @param {Date} preferredTime
 * @param {number} durationHours
 * @returns {Promise<{ recommendedOffice: { officeId: string, officeName: string, confidenceScore: number } } | null>}
 */

const { getAISuggestion } = require('../services/aiSuggestService');

async function smartSuggest(req, res) {
  try {

    const { preferredTime, durationHours } = req.body;
    const email = req.user?.email;
    if (!email || !preferredTime || !durationHours) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const preferredStart = new Date(preferredTime);
    const preferredEnd = new Date(preferredStart.getTime() + durationHours * 60 * 60 * 1000);

    // Fetch user data by email
    const user = await User.findOne({ email }).populate('bookingHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Fetch all offices
    const offices = await Office.find({});
    // Filter available offices
    const availableOffices = offices.filter(office =>
      office.availability.some(slot => preferredStart >= slot.start && preferredEnd <= slot.end)
    );
    if (availableOffices.length === 0) {
      return res.status(404).json({ error: 'No available office found for the requested time.' });
    }

    // Use AI if enabled, otherwise fallback to basic logic
    if (process.env.USE_REAL_AI === 'true' && process.env.HF_API_KEY) {
      try {
        const aiResult = await getAISuggestion({
          user,
          offices: availableOffices,
          preferredTime,
          durationHours
        });
        // Validate AI result
        if (aiResult.officeId && aiResult.officeName && typeof aiResult.confidenceScore === 'number') {
          return res.json({ recommendedOffice: aiResult });
        }
        throw new Error('AI did not return expected format');
      } catch (err) {
        console.error('AI fallback error:', err.message);
        // Fallback to dummy logic below
      }
    }

    // Fallback: Use basic scoring logic
    let bestOffice = null;
    let bestScore = -1;
    for (const office of availableOffices) {
      let score = 1.0;
      if (user.cancellations > 3) score -= 0.2;
      const similarBookings = user.bookingHistory.filter(b =>
        b.officeId === office.officeId &&
        Math.abs(new Date(b.startTime).getHours() - preferredStart.getHours()) <= 1
      );
      if (similarBookings.length > 0) score += 0.2;
      if (office.availability.length > 2) score += 0.05;
      if (score > bestScore) {
        bestScore = score;
        bestOffice = office;
      }
    }
    return res.json({
      recommendedOffice: {
        officeId: bestOffice.officeId,
        officeName: bestOffice.officeName,
        confidenceScore: Math.min(1, Math.max(0, bestScore)),
      },
    });
  } catch (err) {
    console.error('Smart Suggest Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = { smartSuggest }; 