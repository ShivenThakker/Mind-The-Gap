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

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
// Hardcoded Gemini API Key for the demo.
// If this is set to a non-empty string, Subtext will use it directly.
const HARDCODED_API_KEY = '';

// Shared AI API Backend Configurations (for parallel app store launches)
const USE_BACKEND_SERVER = true;
const BACKEND_SERVER_URL = 'http://localhost:3000';

// ---- System Prompt Library ----

const BASE_PROMPT = `You are Mind The Gap, an expert AI psychologist and social communication coach specializing in decoding the subtle, hidden meanings (subtext) behind text messages. You help users understand what a sender actually means, detect subtle relationship shifts, and craft authentic, context-perfect replies that foster high-quality connections.

ANALYSIS GUIDELINES:
1. INTERNAL REASONING FIRST:
   - You MUST begin your response by writing your step-by-step reasoning in the "reasoning" field. 
   - Analyze: the literal statement, the unstated feelings/desires, relational dynamics, social context, and texting-specific cues.
   - Pay extreme attention to: punctuation choices (e.g., period vs. no punctuation, exclamation marks), emoji selection/absence, response latency, sentence length changes, and any shift from the sender's established behavior.

2. SUBTEXT & INTERPRETATIONS:
   - Provide 1 to 3 distinct interpretations, ordered by likelihood (most probable first).
   - Rate confidence as "high", "medium", or "low".
   - Avoid generic, obvious summaries. Do not say "They are saying they are busy." Instead, explain *why* and *what* it implies. E.g., "The delayed reply combined with a lack of alternative suggestions suggests a soft deflection, indicating they want to keep their distance without being rude."
   - Keep interpretations to 1-2 detailed, punchy sentences. Avoid superficial artificial constraints, but remain highly focused.

3. TONE READING:
   - Assign a highly descriptive, nuanced tone label (e.g., "Passively distant", "Warm but guarded", "Playfully teasing", "Anxiously polite", "Genuinely enthusiastic").
   - Rate warmth on a 0-100 scale (0 = ice cold, 100 = overflowing with warmth).
   - Explain the tone in 1-2 clear sentences citing specific textual evidence.

4. THINGS TO NOTICE:
   - Call out subtle visual or behavioral cues in the "notices" array (e.g., "Stopped using exclamation marks which usually indicate enthusiasm", "The use of a formal period suggests emotional boundary setting").

5. REPLY SUGGESTIONS:
   - Suggested replies must sound like a real, socially intelligent human texting a friend, date, or colleague.
   - Never sound clinical, robotic, manipulative, passive-aggressive, or like a therapist.
   - REGISTER MATCHING: Pay close attention to the sender's style. If they text in all-lowercase with no punctuation, your suggested replies should match that style. If they write in formal, complete sentences, do the same. If they use emojis and enthusiastic punctuation, match that energy.
   - Rationale should be 5-15 words explaining why the reply works socially.

You MUST respond ONLY with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):
{
  "reasoning": "A deep, step-by-step analysis of subtext, psychological dynamics, texting patterns, and register-matching targets.",
  "interpretations": [
    {
      "text": "Nuanced 1-2 sentence explanation of the hidden meaning.",
      "confidence": "high|medium|low"
    }
  ],
  "tone": {
    "label": "Nuanced tone label",
    "explanation": "Detailed explanation of tone citing specific evidence.",
    "warmth": 50
  },
  "notices": [
    "Observation about punctuation, spelling, emojis, length, or response patterns."
  ],
  "replies": [
    {
      "text": "Perfect, natural response matching the sender's texting register.",
      "intent": "Conversational goal",
      "rationale": "Brief social/psychological rationale why this works."
    }
  ]
}`;

const MODE_PROMPTS = {
  general: `
CONTEXT: This is a general social, friendly, or familial conversation. 
FOCUS: Honest tone reading, authentic self-expression, and smooth conversational continuation. 
CALIBRATION: Warm, friendly, and balanced. Avoid assuming romantic tension or professional boundaries.

EXAMPLE:
Message: "i guess we can do that"
Context: You proposed changing a meeting time for a group project.
Person: College classmate
Response:
{
  "reasoning": "The sender uses the phrase 'i guess' and a lowercase 'we can do that' with no punctuation. 'I guess' indicates reluctant compliance rather than genuine agreement. They are accommodating the request but may feel slightly inconvenienced or unenthusiastic about the change.",
  "interpretations": [
    {
      "text": "They are reluctantly agreeing to the new time, likely because it is convenient for the group, but it may not be their preferred choice.",
      "confidence": "high"
    }
  ],
  "tone": {
    "label": "Resigned / Mildly unenthusiastic",
    "explanation": "The hedge 'i guess' coupled with lack of enthusiastic punctuation signals compliance out of necessity rather than enthusiasm.",
    "warmth": 45
  },
  "notices": [
    "Used the qualifying phrase 'i guess' which dampens the agreement.",
    "Lack of capitalization or punctuation suggests a casual, low-energy response."
  ],
  "replies": [
    {
      "text": "if the new time is a hassle for you, we can definitely stick to the original plan! no worries either way.",
      "intent": "Offer flexibility",
      "rationale": "Shows social consideration, reduces pressure, and matches the lowercase casual texting style."
    },
    {
      "text": "awesome, thanks for being flexible! see you then.",
      "intent": "Gracious acknowledgment",
      "rationale": "Accepts the agreement warmly while keeping the vibe light and positive."
    }
  ]
}`,

  dating: `
CONTEXT: This is a romantic, dating, or high-stakes interpersonal context.
FOCUS: Pacing, interest signaling, reciprocity levels, breadcrumbing, soft rejection vs. genuine busyness, and maintaining confidence and high value.
CALIBRATION: Light, confident, warm, and highly attuned to social cues. Never suggest manipulative "mind games" or "negging".

EXAMPLE 1:
Message: "haha yeah we should totally hang out sometime"
Context: You asked them out for drinks last week and they said they were 'super busy but down soon'.
Person: Met on Hinge 2 weeks ago.
Response:
{
  "reasoning": "The sender is using highly enthusiastic words ('totally', 'sometime') but keeping the timeframe completely vague. Because they previously deflected a specific drinks invitation with 'down soon' and are now following up with 'sometime' instead of proposing a day, they are likely breadcrumbing or offering polite deflection to keep options open without intending to commit to a date.",
  "interpretations": [
    {
      "text": "They are keeping you on the hook with vague enthusiasm, but lack the genuine interest or availability to make concrete plans.",
      "confidence": "high"
    },
    {
      "text": "They genuinely want to meet but are socially passive or disorganized, waiting for you to lead the planning again.",
      "confidence": "medium"
    }
  ],
  "tone": {
    "label": "Vaguely enthusiastic but non-committal",
    "explanation": "Phrases like 'totally' and 'sometime' create an illusion of warmth while avoiding any actual scheduling commitment.",
    "warmth": 45
  },
  "notices": [
    "Used 'sometime' instead of proposing a specific date or asking when you are free.",
    "Bypassed the previous opportunity to lock in a time, indicating low urgency."
  ],
  "replies": [
    {
      "text": "for sure! let me know when you have a free evening and we'll make it happen.",
      "intent": "Ball in their court",
      "rationale": "Puts the responsibility of scheduling on them while remaining warm and high-value."
    },
    {
      "text": "haha 'sometime' is a classic. let me know if you actually want to grab those drinks, otherwise no worries!",
      "intent": "Playful call-out",
      "rationale": "Witty and confident; calls out the vagueness playfully without sounding bitter."
    }
  ]
}

EXAMPLE 2:
Message: "Ok."
Context: You sent a long, detailed description of your weekend trip with several photos and asked how their weekend was.
Person: Dating for 2 months. Usually texts with lots of emojis, exclamation marks, and fast responses.
Response:
{
  "reasoning": "A single-word 'Ok.' with a period is a dramatic shift in communication style for someone who typically uses highly active punctuation, emojis, and detailed replies. It is a text-book cold response, signalling either anger, withdrawal, or an intentional effort to create emotional distance.",
  "interpretations": [
    {
      "text": "They are upset about something or intentionally shutting down the conversation, choosing to send a cold response to signal their displeasure.",
      "confidence": "high"
    },
    {
      "text": "They are in an extremely busy or stressful situation where they could only type two letters, but the period still suggests a lack of warmth.",
      "confidence": "medium"
    }
  ],
  "tone": {
    "label": "Frosty and boundary-setting",
    "explanation": "A blunt, single-word reply capped with a formal period is designed to halt the conversation flow and communicate coldness.",
    "warmth": 10
  },
  "notices": [
    "Complete absence of emojis or question marks, contrasting sharply with their typical style.",
    "The period after 'Ok' adds a formal, sharp termination to their message."
  ],
  "replies": [
    {
      "text": "hey, is everything okay? you seem a little quiet.",
      "intent": "Gentle check-in",
      "rationale": "Directly addresses the shift in energy without being accusatory, showing maturity."
    },
    {
      "text": "sounds good! let me know when you're free to catch up.",
      "intent": "Mirror energy & disengage",
      "rationale": "Matches their brevity without showing anxiety or chasing their approval."
    }
  ]
}`,

  interview: `
CONTEXT: This is a professional, networking, or job application context.
FOCUS: Polished execution, strategic positioning, maintaining confidence without arrogance, timing, and clear next steps.
CALIBRATION: Professional, warm, and highly respectful. Never use casual slang, emojis (unless matching a casual tech environment), or flirtatious tones.

EXAMPLE:
Message: "We will keep your resume on file and reach out if any suitable roles open up in the future."
Context: Had a final-round interview last week.
Person: Recruiter
Response:
{
  "reasoning": "This is a standard polite rejection phrase. While it holds out a theoretical possibility of future contact ('keep your resume on file'), it signals that the hiring process for this role is officially concluded and you were not selected. The tone is highly standardized and formal.",
  "interpretations": [
    {
      "text": "You were not selected for the position, and the hiring process for this role is officially over.",
      "confidence": "high"
    }
  ],
  "tone": {
    "label": "Polite and professional but final",
    "explanation": "Standardized corporate phrasing designed to deliver a rejection gently but decisively.",
    "warmth": 30
  },
  "notices": [
    "Use of the formal future conditional 'reach out if... open up' represents a standard HR rejection template.",
    "Completely transactional and polite, with no personalized feedback."
  ],
  "replies": [
    {
      "text": "Thank you for the update and for the opportunity to meet the team. I really enjoyed learning about the role and would love to stay in touch for future opportunities.",
      "intent": "Gracious exit",
      "rationale": "Maintains professional goodwill and leaves a highly positive final impression."
    }
  ]
}`
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
      temperature: 0.75,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: -1
      }
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
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').join('');

    if (!text || !text.trim()) {
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
    reasoning: String(data.reasoning || ''),
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

  if (message.type === 'GENERATE_OPENER') {
    handleGenerateOpener(message.payload)
      .then(function(result) {
        sendResponse({ type: 'OPENER_RESULT', payload: result });
      })
      .catch(function(error) {
        sendResponse({
          type: 'OPENER_ERROR',
          payload: {
            error: error.message,
            retryable: isRetryable(error)
          }
        });
      });
    return true; // Keep message channel open for async
  }

  if (message.type === 'GET_PENDING_RETROSPECTIVE') {
    chrome.storage.local.get(['pastAnalyses'], function(data) {
      const pastAnalyses = data.pastAnalyses || [];
      const now = Date.now();
      // For demo: prompt for any analysis created at least 30 seconds ago with no feedback
      // In production, this would be 24 hours (24 * 60 * 60 * 1000)
      const RETROSPECTIVE_DELAY = 30 * 1000; 
      
      const pending = pastAnalyses.find(function(entry) {
        return entry.feedback === null && (now - entry.timestamp) >= RETROSPECTIVE_DELAY;
      });
      
      sendResponse({ type: 'PENDING_RETROSPECTIVE_RESULT', payload: pending || null });
    });
    return true; // Keep message channel open for async
  }

  if (message.type === 'SUBMIT_RETROSPECTIVE_FEEDBACK') {
    const { analysisId, feedback } = message.payload;

    // Send to central server if enabled
    if (USE_BACKEND_SERVER) {
      chrome.storage.local.get(['pastAnalyses'], function(data) {
        const pastAnalyses = data.pastAnalyses || [];
        const entry = pastAnalyses.find(e => e.id === analysisId);
        if (entry) {
          fetch(`${BACKEND_SERVER_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisId: entry.id,
              platform: 'chrome_extension',
              rating: feedback,
              message: entry.message,
              aiAnalysis: entry.analysis
            })
          }).catch(err => console.error('Error logging feedback centrally:', err));
        }
      });
    }

    chrome.storage.local.get(['pastAnalyses'], function(data) {
      const pastAnalyses = data.pastAnalyses || [];
      const updated = pastAnalyses.map(function(entry) {
        if (entry.id === analysisId) {
          return Object.assign({}, entry, {
            feedback: feedback,
            feedbackTimestamp: Date.now()
          });
        }
        return entry;
      });
      chrome.storage.local.set({ pastAnalyses: updated }, function() {
        sendResponse({ type: 'FEEDBACK_SUBMITTED_SUCCESS' });
      });
    });
    return true;
  }
});

async function handleAnalyze(payload) {
  if (USE_BACKEND_SERVER) {
    try {
      const url = `${BACKEND_SERVER_URL}/api/analyze`;
      const body = {
        message: payload.message,
        mode: payload.mode || 'general',
        helpLevel: payload.helpLevel || 3,
        responseStyle: payload.responseStyle || 'balanced',
        context: payload.context || [],
        personDescription: payload.personDescription || ''
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }
      if (response.status === 403) {
        throw new Error('INVALID_API_KEY');
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'API_ERROR: ' + response.status);
      }

      const result = await response.json();
      saveAnalysisToHistory(payload, result);
      return result;
    } catch (error) {
      console.warn('Backend server failed or offline, falling back to direct API calling:', error);
      if (error.message === 'INVALID_API_KEY' || error.message === 'RATE_LIMITED' || error.message === 'NO_API_KEY') {
        throw error;
      }
      return await callDirectGemini(payload);
    }
  } else {
    return await callDirectGemini(payload);
  }
}

async function callDirectGemini(payload) {
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

  const result = await callGemini(apiKey, systemPrompt, userMessage);
  saveAnalysisToHistory(payload, result);
  return result;
}

function saveAnalysisToHistory(payload, result) {
  chrome.storage.local.get(['pastAnalyses'], function(data) {
    const pastAnalyses = data.pastAnalyses || [];
    const entry = {
      id: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      message: payload.message,
      context: payload.context || [],
      personDescription: payload.personDescription || '',
      mode: payload.mode || 'general',
      helpLevel: payload.helpLevel || 3,
      analysis: result,
      feedback: null,
      feedbackTimestamp: null
    };
    pastAnalyses.push(entry);
    // Keep max 50 analyses to remain within storage bounds
    if (pastAnalyses.length > 50) {
      pastAnalyses.shift();
    }
    chrome.storage.local.set({ pastAnalyses: pastAnalyses });
  });
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

// Enforce 'general' default mode on installation or extension updates/reloads
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(['defaultMode', 'defaultHelpLevel', 'responseStyle'], function(settings) {
    const newSettings = {};
    if (!settings.defaultMode || settings.defaultMode === 'dating') {
      newSettings.defaultMode = 'general';
    }
    if (!settings.defaultHelpLevel) {
      newSettings.defaultHelpLevel = 3;
    }
    if (!settings.responseStyle) {
      newSettings.responseStyle = 'balanced';
    }
    chrome.storage.sync.set(newSettings);
  });
});

// ============================================================
// Opening Line / One-Liner Generator Logic
// ============================================================

const OPENER_BASE_PROMPT = `You are Mind The Gap, an expert conversational strategist specializing in drafting highly original, brilliant, and tailored opening lines (one-liners) for any text-based scenario.
Based on the details provided, your job is to generate exactly three distinct opening lines categorized by risk level: "safe", "risky", and "unhinged".

You MUST respond ONLY with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):
{
  "safe": "Friendly, charming, low-pressure, natural conversation starter.",
  "risky": "Playful, witty, bold, teasing, or highly opinionated banter.",
  "unhinged": "Extremely bold, bizarre, surreal, conceptual, or laugh-out-loud funny opener."
}

RULES BY RISK LEVEL:
1. SAFE: Polite, warm, zero-stakes, easy and natural to respond to. Designed to get a guaranteed comfortable response.
2. RISKY: Witty, direct, teasing, or confident. Takes a small social gamble (like a mild assumption or light banter) to spark high-energy chemistry or intrigue.
3. UNHINGED: Highly creative, quirky, surreal, or weirdly conceptual. Designed to make them laugh or think "what in the world did I just read?" MUST stay appropriate to the context and mode.

MODE-SPECIFIC GUARDRAILS:
- general: Clever, casual, or friendly. The "unhinged" option should be a funny, surreal question or a bizarre "hot take" (e.g., "is cereal soup?").
- dating: Flirtatious, charming, witty, or playfully weird. Match the energy of their bio or preferences. Keep the unhinged option delightfully bold, bizarre, or highly creative, avoiding anything actually offensive or creepy.
- interview: 100% PROFESSIONAL AND SAFE-FOR-WORK (SFW). Even the "unhinged" option must be strictly respectful and SFW, but can be highly memorable, bold, or creative (e.g., proposing a bold growth hypothesis, pitching a creative professional idea, or opening with an ultra-confident yet polite direct hook). NEVER use slang, dating language, or informal jokes here.

EXAMPLE:
Context: "Met on Hinge. She says she loves hiking and could eat authentic carbonara every day."
Mode: dating
Response:
{
  "safe": "Hey! I see you're a carbonara fan — are we talking authentic guanciale and pecorino, or are you secretly okay with cream in it? 😉",
  "risky": "If we go hiking, I'm bringing a portable stove to make carbonara at the summit. If it's terrible, you can leave me on the mountain. Deal?",
  "unhinged": "We are getting married, but the wedding venue is Mt. Everest summit and the catering is strictly carbonara. Pack your hiking boots."
}
`;

function buildOpenerSystemPrompt(mode) {
  let prompt = OPENER_BASE_PROMPT;
  prompt += `\nCURRENT MODE: ${mode.toUpperCase()}\n`;
  if (mode === 'general') {
    prompt += `\nFOCUS: Friendly, lighthearted, clever, or witty. Ensure that even the unhinged option is a fun conversation starter, not weird in an offensive way.\n`;
  } else if (mode === 'dating') {
    prompt += `\nFOCUS: Charm, chemistry, dynamic energy, light banter, or flirting. The safe option should be pleasant and engaging, the risky option should be direct/cheeky, and the unhinged option should be charmingly weird or extremely bold and funny.\n`;
  } else if (mode === 'interview') {
    prompt += `\nFOCUS: Professional networking, recruiter messages, or hiring follow-up. MUST BE 100% SFW. The safe option is standard and ultra-polite. The risky option is highly direct and ultra-confident. The unhinged option should be highly unconventional, memorable, bold, or creative, but STILL strictly polite, professional, and respectful. NEVER use informal slang, jokes, or flirtatious remarks in interview mode.\n`;
  }
  return prompt;
}

async function handleGenerateOpener(payload) {
  if (USE_BACKEND_SERVER) {
    try {
      const url = `${BACKEND_SERVER_URL}/api/opener`;
      const body = {
        context: payload.context || '',
        mode: payload.mode || 'general'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }
      if (response.status === 403) {
        throw new Error('INVALID_API_KEY');
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'API_ERROR: ' + response.status);
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend server failed or offline, falling back to direct API calling:', error);
      if (error.message === 'INVALID_API_KEY' || error.message === 'RATE_LIMITED' || error.message === 'NO_API_KEY') {
        throw error;
      }
      return await callDirectOpener(payload);
    }
  } else {
    return await callDirectOpener(payload);
  }
}

async function callDirectOpener(payload) {
  const settings = await getFromStorage('sync', ['apiKey']);
  const apiKey = settings.apiKey || HARDCODED_API_KEY;

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const mode = payload.mode || 'general';
  const context = payload.context || '';

  const systemPrompt = buildOpenerSystemPrompt(mode);
  const userMessage = `CONTEXT/PROMPT FOR OPENING LINE: "${context}"`;

  return await callGeminiOpener(apiKey, systemPrompt, userMessage);
}

async function callGeminiOpener(apiKey, systemPrompt, userMessage, retries) {
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
      temperature: 0.85,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
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
        return callGeminiOpener(apiKey, systemPrompt, userMessage, retries - 1);
      }
      throw new Error('RATE_LIMITED');
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(function() { return {}; });
      throw new Error('BAD_REQUEST: ' + (errorData?.error?.message || 'Invalid request'));
    }

    if (response.status === 403) {
      throw new Error('INVALID_API_KEY');
    }

    if (!response.ok) {
      if (retries > 0) {
        await delay(1000);
        return callGeminiOpener(apiKey, systemPrompt, userMessage, retries - 1);
      }
      throw new Error('API_ERROR: ' + response.status);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map(function(p) { return p.text || ''; }).join('');

    if (!text || !text.trim()) {
      throw new Error('EMPTY_RESPONSE');
    }

    return parseOpenerResponse(text);

  } catch (error) {
    if (error.message.startsWith('RATE_LIMITED') ||
        error.message.startsWith('INVALID_API_KEY') ||
        error.message.startsWith('BAD_REQUEST') ||
        error.message.startsWith('API_ERROR')) {
      throw error;
    }

    if (retries > 0) {
      await delay(1000);
      return callGeminiOpener(apiKey, systemPrompt, userMessage, retries - 1);
    }

    throw new Error('NETWORK_ERROR: ' + error.message);
  }
}

function parseOpenerResponse(text) {
  let cleaned = text.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      safe: String(parsed.safe || ''),
      risky: String(parsed.risky || ''),
      unhinged: String(parsed.unhinged || '')
    };
  } catch (e) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          safe: String(parsed.safe || ''),
          risky: String(parsed.risky || ''),
          unhinged: String(parsed.unhinged || '')
        };
      } catch (e2) {
        throw new Error('PARSE_ERROR: Could not parse AI response as JSON');
      }
    }
    throw new Error('PARSE_ERROR: No JSON found in AI response');
  }
}
