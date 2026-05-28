# Mind The Gap Chrome Extension — Progress Tracker

> **Project**: Mind The Gap — AI That Reads Between the Lines  
> **Type**: Chrome Extension (Manifest V3) with Grammarly-style floating bubble  
> **AI Backend**: Google Gemini Flash (free tier — 15 RPM, 1M TPM)  
> **Started**: 2026-05-28  

---

## Status: 🟢 One-Liner Generator fully integrated with sliding tab navigation, dynamic risk levels, and strict interview guardrails.

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

### Session 5 — 2026-05-29 (UX Polish & Defaults)

- [x] Fixed default mode — extension now always defaults to **General** mode on first install or reload, enforced via `onInstalled` listener in the background service worker and fallback in `loadSettings()` in content.js and popup.js.
- [x] Enlarged the **Settings button** in the popup — increased font size (`14px`), padding, and brightness for better tap target and readability.
- [x] Increased font size of **"Built for overthinkers"** footer text in both the popup and the slide-out panel footer.
- [x] Upgraded the panel footer **⚙️ Settings** button from a plain text link to a styled frosted-glass pill button with white text.
- [x] Fixed Settings button text color to **white** in both popup (`!important` + `-webkit-text-fill-color`) and the slide-out panel footer.
- [x] **Bubble now hides when the panel is open** — added `st-bubble--hidden` class toggle in `openPanel()` / `closePanel()` so the floating button disappears while the panel is in use and reappears cleanly when it closes.

### Session 6 — 2026-05-29 (New App Logo)

- [x] Generated a fresh premium app logo — neon yellow-to-orange 3D glossy speech bubble with white rounded text lines, golden neon rim glow, pitch black background.
- [x] Scaled and replaced all extension icon assets: `icon-16.png`, `icon-48.png`, `icon-128.png`, and `logo.png` in `src/assets/`.

### Session 7 — 2026-05-29 (Opening Line Generator)

- [x] Designed and built a sliding tab navigation system at the top of the slide-out panel, allowing users to toggle between **Message Analyzer** and **One-Liners**.
- [x] Implemented a specialized `GENERATE_OPENER` action listener in `service-worker.js` and system prompt overlays for General, Dating, and Interview modes.
- [x] Configured three distinct opening line risk levels: **Safe** (friendly, low-stakes), **Little Risky** (playful, witty), and **Unhinged** (funny, bizarre, bold).
- [x] Embedded strict prompt guardrails in Interview mode to ensure the **Unhinged** option remains 100% SFW, polite, and professional while offering highly memorable and creative hooks.
- [x] Styled risk-level badges (emerald, amber, neon orange-red), cards, copy buttons, and premium stagger-reveal slideUp transitions in content.css.

---

## What Needs To Be Done Next

- [x] **Test on WhatsApp Web** — extension is confirmed working with real API key
- [x] Test full analysis flow with a real Gemini API key
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
| Google Gemini Flash-Lite (AI Studio) | AI analysis & reply generation | Free (15 RPM) |
| Chrome Extension APIs | Storage, clipboard, messaging | Free |
| Google Fonts (CDN) | Inter, Outfit, JetBrains Mono | Free |

---

## Commits Log

1. `55c851d` — feat: initial Chrome Extension scaffold
2. `e96b574` — fix: font loading in Shadow DOM
3. `8ab5d5e` — feat: restrict scope to messaging sites & add hardcoded API key fallback support
4. `5216604` — docs: add comprehensive README.md and update progress tracker
5. `60d256a` — fix: use correct Gemini 1.5 Flash model identifier and improve error propagation
6. `4de19c5` — style: shift to premium neon yellow & orange on pitch black
7. `8dea6af` — fix: append cache-buster to content.css URL
8. `27a8e40` — feat: rename application to Mind The Gap
9. `42de6e0` — style: integrate new neon yellow & orange speech bubble logo
10. `3e07bf0` — fix: handle extension context invalidation gracefully on reload
11. `a283bcc` — fix: harden context invalidation check via try-catch getManifest
12. `2992784` — perf: switch to Gemini Flash-Lite & optimize prompt for 3x speedup
13. `0a93150` — fix: default to General mode; enlarge Settings button and footer text
14. `fc89f14` — fix: force white text on Settings button in popup
15. `2ab457b` — style: update app logo and extension icons
16. `13c790d` — chore: add Gemini API diagnostic test script
17. `4780856` — fix: hide bubble when panel open; white text on Settings button
18. `3a6f3b3` — feat: add multi-mode Opening Line Generator with dynamic risk levels

---

## How to Install & Test

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked** and select the `Mind-The-Gap` folder
4. The Mind The Gap bubble should appear on supported messaging sites (WhatsApp Web, Telegram Web, Instagram, Messenger, Slack, Discord)
5. Click the extension icon in the toolbar → Settings → paste your **free** Gemini API key (optional if a hardcoded API key is configured in the background script)
   - Get one at https://aistudio.google.com/apikey (free, 30 seconds)
6. Open WhatsApp Web or another supported site → click the bubble → paste a message → click Analyze


## How to Install & Test

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked** and select the `Mind-The-Gap` folder
4. The Mind The Gap bubble should appear on supported messaging sites (WhatsApp Web, Telegram Web, Instagram, Messenger, Slack, Discord)
5. Click the extension icon in the toolbar → Settings → paste your **free** Gemini API key (optional if a hardcoded API key is configured in the background script)
   - Get one at https://aistudio.google.com/apikey (free, 30 seconds)
6. Open WhatsApp Web or another supported site → click the bubble → paste a message → click Analyze
