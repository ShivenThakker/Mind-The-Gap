// ============================================================
// Subtext — Gemini Flash AI Service
// ============================================================
// Handles API calls to Google Gemini Flash (free tier).
// Used by the service worker — never runs in page context.
// ============================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Call the Gemini Flash API with the given system prompt and user message.
 * @param {string} apiKey - Gemini API key
 * @param {string} systemPrompt - Full system prompt
 * @param {string} userMessage - User message (context + message to analyze)
 * @param {number} retries - Number of retries remaining
 * @returns {Object} Parsed analysis result
 */
export async function callGemini(apiKey, systemPrompt, userMessage, retries = 2) {
  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (response.status === 429) {
      // Rate limited
      if (retries > 0) {
        await delay(2000);
        return callGemini(apiKey, systemPrompt, userMessage, retries - 1);
      }
      throw new Error('RATE_LIMITED');
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`BAD_REQUEST: ${errorData?.error?.message || 'Invalid request'}`);
    }

    if (response.status === 403) {
      throw new Error('INVALID_API_KEY');
    }

    if (!response.ok) {
      if (retries > 0) {
        await delay(1000);
        return callGemini(apiKey, systemPrompt, userMessage, retries - 1);
      }
      throw new Error(`API_ERROR: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('EMPTY_RESPONSE');
    }

    return parseAnalysisResponse(text);

  } catch (error) {
    if (error.message.startsWith('RATE_LIMITED') ||
        error.message.startsWith('INVALID_API_KEY') ||
        error.message.startsWith('BAD_REQUEST')) {
      throw error;
    }

    // Network or unexpected error
    if (retries > 0) {
      await delay(1000);
      return callGemini(apiKey, systemPrompt, userMessage, retries - 1);
    }

    throw new Error(`NETWORK_ERROR: ${error.message}`);
  }
}

/**
 * Parse the AI response text into structured analysis data.
 * Handles cases where Gemini wraps JSON in markdown code fences.
 */
function parseAnalysisResponse(text) {
  let cleaned = text.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return validateAndNormalize(parsed);
  } catch (e) {
    // Try to extract JSON from the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateAndNormalize(parsed);
      } catch (e2) {
        throw new Error('PARSE_ERROR: Could not parse AI response as JSON');
      }
    }
    throw new Error('PARSE_ERROR: No JSON found in AI response');
  }
}

/**
 * Validate and normalize the parsed response to ensure all fields exist.
 */
function validateAndNormalize(data) {
  return {
    interpretations: Array.isArray(data.interpretations)
      ? data.interpretations.map(i => ({
          text: String(i.text || ''),
          confidence: ['high', 'medium', 'low'].includes(i.confidence) ? i.confidence : 'medium'
        }))
      : [{ text: 'Unable to generate interpretation', confidence: 'low' }],

    tone: {
      label: String(data.tone?.label || 'Neutral'),
      explanation: String(data.tone?.explanation || ''),
      warmth: typeof data.tone?.warmth === 'number'
        ? Math.max(0, Math.min(100, data.tone.warmth))
        : 50
    },

    notices: Array.isArray(data.notices)
      ? data.notices.map(n => String(n))
      : [],

    replies: Array.isArray(data.replies)
      ? data.replies.map(r => ({
          text: String(r.text || ''),
          intent: String(r.intent || 'General reply'),
          rationale: String(r.rationale || '')
        }))
      : []
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
