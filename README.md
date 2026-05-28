# Subtext 🔮

> **The AI That Reads Between the Lines** — A premium Chrome Extension (Manifest V3) that provides real-time social intelligence, tone decoding, and context-aware reply suggestions directly inside your favorite messaging platforms.

---

## 🚀 The Concept

Have you ever spent hours overthinking a nine-word text message, drafting seventeen different responses, or screenshotting a conversation to ask your friends what it means? 

**Subtext** is social intelligence in the browser. Floating as a sleek, Grammarly-style interactive bubble, it slides open into a glassmorphic analysis panel where you can paste incoming texts and get instant, psychology-backed breakdowns of tone, hidden motivations, and highly calibrated response suggestions — all without leaving your chat window.

---

## ✨ Features

- **Floating bubble entry point**: Minimalist, pulsing violet bubble fixed to the screen corner on messaging sites.
- **Glassmorphism Slide-out Panel**: Premium visual aesthetic built with vanilla CSS tokens, backdrop filters, and custom scrollbars.
- **Three Strategic Modes**:
  - 💬 **General**: Authentic, balanced social communications.
  - ❤️ **Dating**: Pacing cues, interest level signaling, and de-escalation of mixed signals.
  - 💼 **Interview**: Professional poise, recruiter-friendly follow-ups, and candidate positioning.
- **Segmented Help Levels**:
  - **Level 1**: Tone & Interpretation analysis only (no replies).
  - **Level 2**: Full analysis + exactly 1 context-optimized reply.
  - **Level 3**: Full analysis + 3 diverse strategic response suggestions.
- **Interaction Cards**: Suggested replies feature intent badges (e.g. *"Show interest"*, *"Set boundary"*), copy-to-clipboard buttons, and a **"Use & Edit"** action that loads the suggestion back into the workspace.
- **Tone Heatmap**: A stylized visual bar showing exact warmth levels (0 to 100) from ❄️ Cold to 🔥 Warm.
- **Conversation Threading**: Remembers context across multiple inputs within a page session, enabling progressive conversation coaching.

---

## 🛠️ Architecture

Subtext is built with absolute performance, reliability, and security in mind:
- **Shadow DOM Isolation**: All injected elements (the bubble, overlay, panel, and notifications) are contained inside an isolated Shadow DOM root. The extension's styles **cannot leak** to the host page, and the host page's CSS **cannot break** the extension.
- **Secure Service Worker Proxy**: The Gemini API calls are made in the isolated background script. The API Key is never exposed to the host page's DOM or context script.
- **Multi-source API Key Fallback**: Supports both user-saved settings (`chrome.storage.sync`) and a hardcoded demo fallback key (`const HARDCODED_API_KEY`) defined in the service worker.

---

## 📦 Supported Messaging Sites

The content script is optimized to run strictly on the following platforms to protect user privacy and extension efficiency:
- **WhatsApp Web** (`web.whatsapp.com`)
- **Instagram Direct** (`instagram.com`)
- **Telegram Web** (`web.telegram.org`)
- **Messenger** (`messenger.com`)
- **Slack Web** (`slack.com`)
- **Discord Web** (`discord.com`)

---

## 🛠️ Installation & Setup

### 1. Load the Extension in Chrome
1. Open Google Chrome.
2. Navigate to `chrome://extensions` in the address bar.
3. Toggle **Developer mode** in the top-right corner to **ON**.
4. Click **Load unpacked** in the top-left corner.
5. Select the project repository directory: `Mind-The-Gap`.
6. Pin **Subtext** from the extension toolbar menu.

### 2. Configure Your Gemini API Key
To utilize the AI capabilities, you'll need a free Gemini API key:
- **Option A (Hardcoded for Demo)**:
  1. Open `src/background/service-worker.js`.
  2. Define your key at the top: `const HARDCODED_API_KEY = 'AIzaSy...';`.
  3. Save the file and reload the extension in Chrome. The settings page and toolbar popup will automatically display a green *"✓ Using hardcoded API key for demo"* status banner.
- **Option B (Options UI Page)**:
  1. Click the Subtext toolbar icon and click **Settings**.
  2. Paste your key in the input field and click **Save API Key**.

---

## 🧑‍💻 Technical Specifications

- **Tech Stack**: Vanilla HTML5, Vanilla ES6+ JavaScript, Vanilla CSS3 (Custom Properties).
- **Backend API**: Google Gemini Flash (`gemini-2.0-flash`) via structured JSON response formatting.
- **Design Tokens**: Fully scoped custom properties on `:host` container inside the shadow DOM.
- **Fonts**: Loaded via injected `<link>` tags in the parent document for flawless Shadow DOM rendering (`Inter`, `Outfit`, and `JetBrains Mono`).

---

## 💜 Built for overthinkers.
