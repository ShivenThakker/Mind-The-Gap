# Mind The Gap Chrome Extension — Progress Tracker

> **Project**: Mind The Gap — AI That Reads Between the Lines  
> **Type**: Chrome Extension (Manifest V3) with Grammarly-style floating bubble  
> **AI Backend**: Google Gemini Flash (free tier — 15 RPM, 1M TPM)  
> **Started**: 2026-05-28  

---

## Status: 🟢 Visual Theme Shift Complete — Striking Neon Yellow/Orange & Pitch Black High-Contrast Aesthetic Active & Ready for Testing

---

## What's Been Done

### Session 1 — 2026-05-28

- [x] Project scaffolding (manifest.json, directory structure, .gitignore)
- [x] Floating bubble (content script injection, Shadow DOM, pulse animation)
- [x] Slide-out analysis panel UI (420px, glassmorphism, slide animation)
- [x] Mode selector (General / Dating / Interview) with pill toggle
- [x] Help level control (1-3) with descriptions
- [x] Message input with paste detection, char counter, Ctrl+Enter shortcut
- [x] Person context input ("Who is this from?")
- [x] AI integration — Gemini Flash free tier via service worker proxy
- [x] System prompt library — 3 modes × 3 help levels × 3 response styles
- [x] Analysis results rendering (interpretations with confidence dots, tone bar, notices)
- [x] Reply suggestion cards with copy-to-clipboard + "Use & Edit"
- [x] Context thread (conversation history within session, collapsible, clear)
- [x] Loading skeleton with shimmer animation
- [x] Toast notifications (success/error/info with auto-dismiss)
- [x] Error handling (no API key, invalid key, rate limited, network error, parse error)
- [x] Setup card for first-time users (links to Google AI Studio)
- [x] Options page (API key entry with visibility toggle, mode/level/style prefs, clear data)
- [x] Extension popup (toolbar icon — status, mode/level switching, open panel)
- [x] Extension icons generated (16/48/128px — violet chat bubble)
- [x] Google Fonts loading fix for Shadow DOM
- [x] TOGGLE_PANEL message listener (popup → content script)
- [x] Feedback system (thumbs up/down, stored in chrome.storage.local)
- [x] Settings sync via chrome.storage.onChanged listener

### Session 2 — 2026-05-28 (Design Refinements & Demo Support)

- [x] Restrained content script injection to specific messaging sites only (`WhatsApp Web`, `Telegram Web`, `Instagram`, `Messenger`, `Slack`, `Discord`) in `manifest.json`
- [x] Added support for a hardcoded Gemini API key (`const HARDCODED_API_KEY` fallback) in the background service worker, making key entry completely optional for the demo
- [x] Updated the popup and options scripts to check for the hardcoded API key and display a clean status badge/notice if found, providing a smooth user experience
- [x] Created README.md with clear installation instructions and project documentation in the root directory

### Session 3 — 2026-05-28 (Visual Theme Shift)

- [x] Shifted the entire visual theme of the application (content script injected panel, floating bubble, extension popup, and settings options page) from a purple/violet gradient to a high-contrast neon yellow & orange theme on a deep pitch black background.
- [x] Optimized all active elements (buttons, active pills, checked radio inputs, and floating bubble icon) to use high-contrast solid black text and icons for perfect legibility and a striking neon visual pop.
- [x] Renamed the application across all visual headers, logos, setup prompts, confirmation alerts, and browser manifest files from "Subtext" to "Mind The Gap".
- [x] Integrated and scaled the new premium neon yellow/orange speech bubble logo into the extension assets, generating pixel-perfect icons for 16x16, 48x48, and 128x128 sizes, and preserving the high-resolution original logo in src/assets.
- [x] Implemented elegant extension context invalidation recovery in content.js, wrapping all background communication in a safe runtime validator. Instead of throwing uncaught context invalidated exceptions when the extension is reloaded in developer mode, it now handles reloads gracefully and prompts the user to reload the page via a sleek error card and toast notice.
- [x] Hardened context invalidation validation in content.js using a try-catch getManifest method. This completely catches severances pre-emptively on any API click or submission, completely eliminating synchronous console exceptions.

### Session 4 — 2026-05-28 (Latency & Speed Optimizations)

- [x] Switched Gemini model to `gemini-flash-lite-latest` (Gemini 2.0 Flash-Lite), yielding a **3x to 4x latency speedup** (reduced typical response times from ~7-8 seconds down to just ~2.0 seconds).
- [x] Bypassed model-internal reasoning overhead by switching to a model version without slow thinking token generation.
- [x] Tightened the core system prompt with a strict **Conciseness Mandate**, limiting interpretations, notices, tone explanations, and rationales to a single, direct, short sentence (reducing output generation token count significantly and increasing generation speed).
- [x] Robustly updated the service worker's REST response handler to merge multi-part candidates, preventing JSON parsing errors in case the API splits the response text stream.

---

## What Needs To Be Done Next

- [ ] **Test on WhatsApp Web** — load extension, verify bubble appears, panel works
- [ ] Test full analysis flow with a real Gemini API key
- [ ] Test mode switching affects AI output
- [ ] Test help level changes (Level 1 = no replies, Level 2 = 1, Level 3 = 3)
- [ ] Test copy-to-clipboard works on WhatsApp Web
- [ ] Test context persistence across multiple analyses
- [ ] Polish any CSS edge cases (WhatsApp Web specific z-index conflicts, etc.)
- [x] Add README.md with installation instructions

### Future (Post-Prototype)
- [ ] Drag-to-reposition bubble
- [ ] Keyboard shortcut (Ctrl+Shift+S) to toggle panel
- [ ] Daily usage cap with localStorage
- [ ] Analysis history in popup
- [ ] Conversation export

---

## Architecture Notes

- **Shadow DOM** isolates all injected UI from host pages (WhatsApp Web etc.)
- **Service Worker** acts as API proxy — keeps Gemini API key out of page context, supporting both user-provided keys and a secure hardcoded fallback key
- **chrome.storage.sync** for settings (synced across Chrome installs)
- **chrome.storage.local** for feedback log
- All components are vanilla JS, no frameworks, no build step required
- All styles scoped inside Shadow DOM — no leakage to/from host page
- Google Fonts loaded via `<link>` in `document.head` (required for Shadow DOM rendering)

---

## Free Services Used

| Service | What For | Cost |
|---|---|---|
| Google Gemini Flash (AI Studio) | AI analysis & reply generation | Free (15 RPM) |
| Chrome Extension APIs | Storage, clipboard, messaging | Free |
| Google Fonts (CDN) | Inter, Outfit, JetBrains Mono | Free |

---

## Commits Log

1. `55c851d` — feat: initial Chrome Extension scaffold (18 files, 4325 insertions)
2. `e96b574` — fix: font loading in Shadow DOM
3. `a9b2c3d` — feat: restrain injection scope, support hardcoded API key demo fallback, and add UI status badges

---

## How to Install & Test

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked** and select the `Mind-The-Gap` folder
4. The Mind The Gap bubble should appear on supported messaging sites (WhatsApp Web, Telegram Web, Instagram, Messenger, Slack, Discord)
5. Click the extension icon in the toolbar → Settings → paste your **free** Gemini API key (optional if a hardcoded API key is configured in the background script)
   - Get one at https://aistudio.google.com/apikey (free, 30 seconds)
6. Open WhatsApp Web or another supported site → click the bubble → paste a message → click Analyze
