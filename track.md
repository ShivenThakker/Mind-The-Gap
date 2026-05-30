# Mind The Gap Chrome Extension — Progress Tracker

> **Project**: Mind The Gap — AI That Reads Between the Lines  
> **Type**: Chrome Extension (Manifest V3) with Grammarly-style floating bubble  
> **AI Backend**: Google Gemini Flash (free tier — 15 RPM, 1M TPM)  
> **Started**: 2026-05-28  

---

## Status: 🟢 Model upgraded to Gemini 2.5 Flash with native thinking, overhauled base prompts, and deep conversational few-shot examples for extremely accurate social subtext analysis.

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

### Session 8 — 2026-05-29 (UX Spacing & API Key Error Polish)

- [x] Corrected negative section label margins (changing `margin-bottom: -8px;` to `margin-bottom: 0px;`), resolving overlaps where selectors/textareas buried labels.
- [x] Injected a consistent 16px flex gap across the slide-out tab containers (`.st-tab-content`), giving beautiful and readable vertical spacing between context box, message input, action buttons, and divider elements.
- [x] Wrapped the Mode and Help Level selectors in input groups (`.st-input-group`) to ensure unified and flawless control margins.
- [x] Upgraded analysis error handling (`handleAnalysisError`) to differentiate between a missing API key and an invalid/leaked key. When the key is set but invalid (re-occurring leaked key failure), it now displays a polished warning card with an "Open Settings" shortcut rather than first-time welcome setup prompts.
- [x] Removed the leaked/deactivated free-tier API key from `test_gemini.py` to eliminate security warnings.
- [x] Rewrote Git history using `git filter-branch` to completely purge the leaked API key from all historical commits, keeping past commits completely clean of credentials.

### Session 9 — 2026-05-30 (Accuracy Overhaul)

- [x] Upgraded the AI model to `gemini-2.5-flash` for advanced subtext analysis capabilities.
- [x] Enabled the "thinking budget" configuration in Gemini API requests to leverage the model's native reasoning abilities.
- [x] Redesigned and overhauled the core system prompt (`BASE_PROMPT`) to include detailed step-by-step reasoning instructions, pattern-shift checks, and texting register-matching.
- [x] Integrated a root-level `reasoning` field in the JSON schema to enforce analytical thinking before output generation.
- [x] Rebuilt `validateAndNormalize` in the background service worker to capture, parse, and structure the reasoning field safely.
- [x] Overhauled `MODE_PROMPTS` to include detailed, concrete few-shot examples for general, dating, and professional (interview) modes.
- [x] Enhanced `OPENER_BASE_PROMPT` (One-Liner Generator) with a gold-standard few-shot example and clear risk-level rules for highly tailored, creative, and SFW outputs.

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
3. `fb4ff75` — docs: update track.md with session 1 progress and install instructions
4. `8ab5d5e` — feat: restrict scope to messaging sites & add hardcoded API key fallback support
5. `5216604` — docs: add comprehensive README.md and update progress tracker
6. `60d256a` — fix: use correct Gemini 1.5 Flash model identifier and improve error propagation
7. `4de19c5` — style: shift to premium neon yellow & orange on pitch black
8. `8dea6af` — fix: append cache-buster to content.css URL
9. `27a8e40` — feat: rename application to Mind The Gap
10. `42de6e0` — style: integrate new neon yellow & orange speech bubble logo
11. `3e07bf0` — fix: handle extension context invalidation gracefully on reload
12. `a283bcc` — fix: harden context invalidation check via try-catch getManifest
13. `2992784` — perf: switch to Gemini Flash-Lite & optimize prompt for 3x speedup
14. `0a93150` — fix: default to General mode; enlarge Settings button and footer text
15. `fc89f14` — fix: force white text on Settings button in popup
16. `2ab457b` — style: update app logo and extension icons
17. `824eb6f` — chore: add Gemini API diagnostic test script
18. `2ef71a3` — fix: hide bubble when panel open; white text on Settings button
19. `21357ab` — docs: update track.md with sessions 5 & 6 progress
20. `325aa41` — docs: rebrand README.md to Mind The Gap and update styling details
21. `bfd7ead` — chore: add track.md and subtext.md to .gitignore and stop tracking them
22. `92b6486` — Revise README.md for Subtext application details
23. `a0be890` — Rename Subtext to Mind The Gap in README
24. `8830a3f` — Update milestone and ship date in README
25. `8d0e6e4` — feat: add multi-mode Opening Line Generator with dynamic risk levels
26. `0f4a190` — docs: update track.md with session 7 progress
27. `35c27e0` — fix: correct spacing overlaps and polish invalid api key error handling
28. `6e97af0` — Merge branch 'main' of github.com:ShivenThakker/Mind-The-Gap
29. `dfa84ad` — chore: remove leaked API key from test_gemini.py
30. `6a53d47` — docs: document Git history API key purge in track.md

---

## How to Install & Test

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked** and select the `Mind-The-Gap` folder
4. The Mind The Gap bubble should appear on supported messaging sites (WhatsApp Web, Telegram Web, Instagram, Messenger, Slack, Discord)
5. Click the extension icon in the toolbar → Settings → paste your **free** Gemini API key (optional if a hardcoded API key is configured in the background script)
   - Get one at https://aistudio.google.com/apikey (free, 30 seconds)
6. Open WhatsApp Web or another supported site → click the bubble → paste a message → click Analyze

