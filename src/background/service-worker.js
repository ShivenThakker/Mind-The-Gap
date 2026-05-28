// ============================================================
// Subtext — Service Worker (Background Script)
// ============================================================
// Acts as the API proxy: receives analysis requests from content
// scripts, fetches the API key from storage, calls Gemini, and
// returns results. The API key never enters page context.
//
// NOTE: Chrome MV3 service workers don't support ES module imports
// by default, so all logic is self-contained here.
// ============================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
// Hardcoded Gemini API Key for the demo.
// If this is set to a non-empty string, Subtext will use it directly.
const HARDCODED_API_KEY = '';

// ---- System Prompt Library ----

const BASE_PROMPT = `You are Subtext, an AI that specializes in decoding the hidden meaning behind text messages. You help people understand what a message actually means and craft the perfect reply.

ANALYSIS FRAMEWORK:
- Consider the literal meaning, emotional tone, and what is NOT being said
- Look for contextual signals: punctuation choices, emoji usage, message length, formality level, and any shift from established patterns
- Order interpretations by likelihood (most probable first)
- Assign confidence levels: "high", "medium", or "low"
- Be specific — reference actual words and patterns from the message

TONE RULES:
- Assign a descriptive tone label (e.g., "Warm but guarded", "Passively distant", "Genuinely enthusiastic", "Non-committal")
- Rate warmth on a 0-100 scale (0 = ice cold, 100 = extremely warm)
- Explain what specific textual evidence led to this tone reading

REPLY RULES:
- Suggestions must sound like a real person — not a corporate email, not a therapist, not a LinkedIn influencer
- Match the formality level and energy of the conversation
- Never suggest manipulation, negging, or game-playing tactics
- If the message is genuinely ambiguous, acknowledge that — don't manufacture false certainty
- Each reply should serve a different conversational goal when multiple are requested
- Keep replies concise and natural — the way real people actually text

ANTI-PATTERNS (never do these):
- Don't be dismissive of the user's anxiety ("you're overthinking this")
- Don't diagnose mental health conditions
- Don't suggest passive-aggressive responses
- Don't generate replies that sound robotic or overly formal for casual contexts

You MUST respond ONLY with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):
{
  "interpretations": [
    { "text": "string describing the interpretation", "confidence": "high|medium|low" }
  ],
  "tone": {
    "label": "string — descriptive tone label",
    "explanation": "string — what evidence supports this reading",
    "warmth": 0-100
  },
  "notices": ["string — contextual observations about the message"],
  "replies": [
    {
      "text": "string — the suggested reply",
      "intent": "string — 2-5 word goal label",
      "rationale": "string — why this reply works"
    }
  ]
}`;

const MODE_PROMPTS = {
  general: `
CONTEXT: This is a general conversation. Don't assume romantic or professional context unless the user specifies.
FOCUS: Clear tone reading and natural, genuine reply suggestions. Help the user communicate authentically.
CALIBRATION: Balanced — neither too casual nor too formal. Match the energy of the conversation.`,

  dating: `
CONTEXT: This is a romantic or dating context. The user is texting someone they are interested in (or someone interested in them).
FOCUS: Pacing (don't appear over-eager or disinterested), reciprocity signals, the difference between genuine busyness and soft rejection, interest signaling without desperation.
CALIBRATION:
- Be aware of common dating communication patterns: soft cancels, breadcrumbing, genuine interest signals
- Never suggest "playing games" or "making them wait" — authenticity wins
- Understand that "Ok." and "Ok!" have very different energies
- Notice what the person is NOT saying — did they suggest an alternative? Did they use your name? Did they ask a question back?
- Replies should be warm, confident, and show genuine interest without neediness`,

  interview: `
CONTEXT: This is a professional or job-search context. The user is communicating with recruiters, hiring managers, or professional contacts.
FOCUS: Appropriate formality, strategic positioning (confident but not arrogant), timing awareness, and clear next-step communication.
CALIBRATION:
- Professional but not stiff — human warmth still matters in professional communication
- Replies should advance the professional relationship toward the user's goal
- Be aware of power dynamics (candidate vs. recruiter, junior vs. senior)
- Notice signals of interest (fast reply, specific questions) vs. process moves (form responses, delays)
- Suggestions are polished and purposeful`
};

const HELP_LEVEL_PROMPTS = {
  1: `\nOUTPUT RULES: Provide interpretations, tone analysis, and notices ONLY. Set "replies" to an empty array []. Do NOT generate any reply suggestions.`,
  2: `\nOUTPUT RULES: Provide interpretations, tone analysis, notices, and exactly 1 reply suggestion with rationale in the "replies" array.`,
  3: `\nOUTPUT RULES: Provide interpretations, tone analysis, notices, and exactly 3 reply suggestions in the "replies" array. Each suggestion MUST target a distinctly different conversational goal. Label each with its strategic intent.`
};

const RESPONSE_STYLE_PROMPTS = {
  casual: `\nSTYLE: Reply suggestions should be informal, use lowercase where natural, may include emoji. Think: how a chill, confident friend would text.`,
  balanced: `\nSTYLE: Reply suggestions should be natural and conversational — neither overly formal nor too casual. Appropriate punctuation, warm tone.`,
  formal: `\nSTYLE: Reply suggestions should be polished and properly punctuated, but still warm and human — not robotic or corporate.`
};

function buildSystemPrompt(mode, helpLevel, responseStyle) {
  let prompt = BASE_PROMPT;
  prompt += MODE_PROMPTS[mode] || MODE_PROMPTS.general;
  prompt += HELP_LEVEL_PROMPTS[helpLevel] || HELP_LEVEL_PROMPTS[3];
  prompt += RESPONSE_STYLE_PROMPTS[responseStyle] || RESPONSE_STYLE_PROMPTS.balanced;
  return prompt;
}

function buildUserMessage(message, context, personDescription) {
  const parts = [];

  if (context && context.length > 0) {
    parts.push('CONVERSATION CONTEXT (previous messages in this conversation):');
    context.forEach(msg => {
      const role = msg.role === 'them' ? '[Their message]' : '[Your reply]';
      parts.push(`${role}: "${msg.text}"`);
    });
    parts.push('');
  }

  if (personDescription && personDescription.trim()) {
    parts.push(`ABOUT THIS PERSON: ${personDescription.trim()}`);
    parts.push('');
  }

  parts.push(`NEW MESSAGE TO ANALYZE: "${message}"`);

  return parts.join('\n');
}

// ---- Gemini API ----

async function callGemini(apiKey, systemPrompt, userMessage, retries) {
  if (retries === undefined) retries = 2;
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
      if (retries > 0) {
        await delay(2000);
        return callGemini(apiKey, systemPrompt, userMessage, retries - 1);
      }
      throw new Error('RATE_LIMITED');
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error('BAD_REQUEST: ' + (errorData?.error?.message || 'Invalid request'));
    }

    if (response.status === 403) {
      throw new Error('INVALID_API_KEY');
    }

    if (!response.ok) {
      if (retries > 0) {
        await delay(1000);
        return callGemini(apiKey, systemPrompt, userMessage, retries - 1);
      }
      throw new Error('API_ERROR: ' + response.status);
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
        error.message.startsWith('BAD_REQUEST') ||
        error.message.startsWith('API_ERROR')) {
      throw error;
    }

    if (retries > 0) {
      await delay(1000);
      return callGemini(apiKey, systemPrompt, userMessage, retries - 1);
    }

    throw new Error('NETWORK_ERROR: ' + error.message);
  }
}

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

function validateAndNormalize(data) {
  return {
    interpretations: Array.isArray(data.interpretations)
      ? data.interpretations.map(function(i) {
          return {
            text: String(i.text || ''),
            confidence: ['high', 'medium', 'low'].indexOf(i.confidence) !== -1 ? i.confidence : 'medium'
          };
        })
      : [{ text: 'Unable to generate interpretation', confidence: 'low' }],

    tone: {
      label: String(data.tone?.label || 'Neutral'),
      explanation: String(data.tone?.explanation || ''),
      warmth: typeof data.tone?.warmth === 'number'
        ? Math.max(0, Math.min(100, data.tone.warmth))
        : 50
    },

    notices: Array.isArray(data.notices)
      ? data.notices.map(function(n) { return String(n); })
      : [],

    replies: Array.isArray(data.replies)
      ? data.replies.map(function(r) {
          return {
            text: String(r.text || ''),
            intent: String(r.intent || 'General reply'),
            rationale: String(r.rationale || '')
          };
        })
      : []
  };
}

function delay(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

// ---- Promise wrapper for chrome.storage ----
function getFromStorage(area, keys) {
  return new Promise(function(resolve) {
    chrome.storage[area].get(keys, resolve);
  });
}

// ---- Message Handling ----

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'ANALYZE') {
    handleAnalyze(message.payload)
      .then(function(result) {
        sendResponse({ type: 'ANALYSIS_RESULT', payload: result });
      })
      .catch(function(error) {
        sendResponse({
          type: 'ANALYSIS_ERROR',
          payload: {
            error: error.message,
            retryable: isRetryable(error)
          }
        });
      });
    return true; // Keep message channel open for async
  }

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get([
      'apiKey', 'defaultMode', 'defaultHelpLevel',
      'responseStyle', 'bubblePosition', 'bubblePulse'
    ], function(settings) {
      sendResponse({ type: 'SETTINGS', payload: settings });
    });
    return true;
  }

  if (message.type === 'SAVE_FEEDBACK') {
    saveFeedback(message.payload);
    sendResponse({ type: 'FEEDBACK_SAVED' });
    return false;
  }

  if (message.type === 'CHECK_API_KEY') {
    chrome.storage.sync.get(['apiKey'], function(result) {
      sendResponse({
        type: 'API_KEY_STATUS',
        payload: {
          hasKey: !!result.apiKey || !!HARDCODED_API_KEY,
          isHardcoded: !result.apiKey && !!HARDCODED_API_KEY
        }
      });
    });
    return true;
  }

  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    return false;
  }
});

async function handleAnalyze(payload) {
  const settings = await getFromStorage('sync', ['apiKey', 'responseStyle']);
  const apiKey = settings.apiKey || HARDCODED_API_KEY;

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const mode = payload.mode || 'general';
  const helpLevel = payload.helpLevel || 3;
  const style = payload.responseStyle || settings.responseStyle || 'balanced';

  const systemPrompt = buildSystemPrompt(mode, helpLevel, style);
  const userMessage = buildUserMessage(
    payload.message,
    payload.context || [],
    payload.personDescription || ''
  );

  return await callGemini(apiKey, systemPrompt, userMessage);
}

function saveFeedback(payload) {
  chrome.storage.local.get(['feedbackLog'], function(result) {
    const log = result.feedbackLog || [];
    log.push({
      helpful: payload.helpful,
      timestamp: Date.now()
    });
    if (log.length > 200) {
      log.splice(0, log.length - 200);
    }
    chrome.storage.local.set({ feedbackLog: log });
  });
}

function isRetryable(error) {
  const msg = error.message || '';
  return msg.startsWith('RATE_LIMITED') ||
         msg.startsWith('NETWORK_ERROR') ||
         msg.startsWith('API_ERROR');
}

// ---- Listen for external toggle from popup ----
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'TOGGLE_PANEL_FROM_POPUP') {
    // Forward to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_PANEL' });
      }
    });
  }
});
