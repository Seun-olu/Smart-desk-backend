const axios = require('axios');

// You can use any Hugging Face model endpoint here. We'll use a general-purpose LLM.
const HUGGINGFACE_API_URL = process.env.HF_API_URL || 'https://api-inference.huggingface.co/models/google/gemma-7b-it';
const HUGGINGFACE_API_KEY = process.env.HF_API_KEY || '';

async function getAISuggestion({ user, offices, preferredTime, durationHours }) {
  // Compose a prompt for the LLM
  const prompt = `You are a smart office booking assistant.\n\nUser info: ${JSON.stringify(user)}\n\nAvailable offices: ${JSON.stringify(offices)}\n\nPreferred time: ${preferredTime}\nDuration (hours): ${durationHours}\n\nBased on the user's history, cancellations, and office availability, recommend the best office (officeId and officeName) and a confidence score between 0 and 1.\n\nRespond in JSON: { "officeId": "...", "officeName": "...", "confidenceScore": 0.0 }`;

  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );
    // Parse the model's response
    const text = response.data?.[0]?.generated_text || response.data?.generated_text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('AI response not in expected format');
  } catch (err) {
    console.error('AI Suggestion Error:', err.message);
    throw new Error('Failed to get AI suggestion');
  }
}

module.exports = { getAISuggestion };
