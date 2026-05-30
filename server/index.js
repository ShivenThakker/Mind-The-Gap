const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  BASE_PROMPT,
  MODE_PROMPTS,
  HELP_LEVEL_PROMPTS,
  RESPONSE_STYLE_PROMPTS,
  OPENER_BASE_PROMPT
} = require('./prompts');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const FEEDBACK_FILE = path.join(__dirname, 'feedback_db.json');

app.use(cors());
app.use(express.json());

// ---- Helper Functions ----

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

function parseAnalysisResponse(text) {
  let cleaned = text.trim();

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

// ---- Gemini API Callers ----

async function callGemini(apiKey, systemPrompt, userMessage) {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (response.status === 429) {
    throw new Error('RATE_LIMITED: Google API rate limits exceeded.');
  }

  if (response.status === 403) {
    throw new Error('INVALID_API_KEY: The provided Gemini API key is invalid.');
  }

  if (!response.ok) {
    throw new Error(`API_ERROR: HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || '').join('');

  if (!text || !text.trim()) {
    throw new Error('EMPTY_RESPONSE: Gemini returned an empty response.');
  }

  return parseAnalysisResponse(text);
}

async function callGeminiOpener(apiKey, systemPrompt, userMessage) {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (response.status === 429) {
    throw new Error('RATE_LIMITED: Google API rate limits exceeded.');
  }

  if (response.status === 403) {
    throw new Error('INVALID_API_KEY: The provided Gemini API key is invalid.');
  }

  if (!response.ok) {
    throw new Error(`API_ERROR: HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || '').join('');

  if (!text || !text.trim()) {
    throw new Error('EMPTY_RESPONSE: Gemini returned an empty response.');
  }

  return parseOpenerResponse(text);
}

// ---- Routes ----

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// Message Analysis Route
app.post('/api/analyze', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'SERVER_CONFIG_ERROR: No GEMINI_API_KEY set on the server.' });
    }

    const {
      message,
      mode = 'general',
      helpLevel = 3,
      responseStyle = 'balanced',
      context = [],
      personDescription = ''
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'BAD_REQUEST: message parameter is required.' });
    }

    const systemPrompt = buildSystemPrompt(mode, helpLevel, responseStyle);
    const userMessage = buildUserMessage(message, context, personDescription);

    const analysis = await callGemini(apiKey, systemPrompt, userMessage);
    res.json(analysis);

  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ error: error.message || 'INTERNAL_SERVER_ERROR' });
  }
});

// One-Liner / Opener Generator Route
app.post('/api/opener', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'SERVER_CONFIG_ERROR: No GEMINI_API_KEY set on the server.' });
    }

    const { context, mode = 'general' } = req.body;
    if (!context || !context.trim()) {
      return res.status(400).json({ error: 'BAD_REQUEST: context parameter is required.' });
    }

    const systemPrompt = buildOpenerSystemPrompt(mode);
    const userMessage = `CONTEXT/PROMPT FOR OPENING LINE: "${context}"`;

    const openers = await callGeminiOpener(apiKey, systemPrompt, userMessage);
    res.json(openers);

  } catch (error) {
    console.error('Error generating openers:', error);
    res.status(500).json({ error: error.message || 'INTERNAL_SERVER_ERROR' });
  }
});

// Centralized Feedback Capture Route
app.post('/api/feedback', async (req, res) => {
  try {
    const { analysisId, platform = 'web', rating, message, aiAnalysis } = req.body;

    if (!analysisId || !rating) {
      return res.status(400).json({ error: 'BAD_REQUEST: analysisId and rating are required.' });
    }

    const feedbackEntry = {
      analysisId,
      platform,
      rating,
      message,
      aiAnalysis,
      timestamp: Date.now()
    };

    // Save to local file feedback_db.json
    fs.readFile(FEEDBACK_FILE, 'utf8', (err, data) => {
      let log = [];
      if (!err && data) {
        try {
          log = JSON.parse(data);
        } catch (e) {
          log = [];
        }
      }
      log.push(feedbackEntry);
      
      // Keep file size bounded in case of abuse
      if (log.length > 5000) {
        log.splice(0, log.length - 5000);
      }

      fs.writeFile(FEEDBACK_FILE, JSON.stringify(log, null, 2), 'utf8', (writeErr) => {
        if (writeErr) console.error('Error logging feedback to file:', writeErr);
      });
    });

    res.json({ success: true, message: 'Feedback logged successfully.' });

  } catch (error) {
    console.error('Error logging feedback:', error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Mind The Gap Shared AI Backend listening on port ${PORT}`);
});
