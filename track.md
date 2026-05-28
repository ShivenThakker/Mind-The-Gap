# Subtext Chrome Extension — Progress Tracker

> **Project**: Subtext — AI That Reads Between the Lines  
> **Type**: Chrome Extension (Manifest V3) with Grammarly-style floating bubble  
> **AI Backend**: Google Gemini Flash (free tier — 15 RPM, 1M TPM)  
> **Started**: 2026-05-28  

---

## Status: 🟡 In Progress

---

## What's Been Done

### Session 1 — 2026-05-28

- [ ] Project scaffolding (manifest.json, directory structure)
- [ ] Floating bubble (content script injection, Shadow DOM)
- [ ] Slide-out analysis panel UI
- [ ] Mode selector (General / Dating / Interview)
- [ ] Help level control (1-3)
- [ ] Message input with paste detection
- [ ] AI integration (Gemini Flash free tier)
- [ ] System prompt library (per mode, per level)
- [ ] Analysis results rendering (interpretations, tone, notices)
- [ ] Reply suggestion cards with copy-to-clipboard
- [ ] Context thread (conversation history within session)
- [ ] Loading skeleton & toast notifications
- [ ] Options page (API key entry, preferences)
- [ ] Extension popup (toolbar icon)
- [ ] Extension icons generated
- [ ] Polish & animations
- [ ] Final testing on WhatsApp Web

---

## What Needs To Be Done Next

_(Updated at end of each session)_

---

## Architecture Notes

- **Shadow DOM** isolates all injected UI from host pages (WhatsApp Web etc.)
- **Service Worker** acts as API proxy — keeps Gemini API key out of page context
- **chrome.storage.sync** for settings, **chrome.storage.local** for history/session
- All components are vanilla JS, no frameworks
- All styles scoped inside Shadow DOM — no leakage to/from host page

---

## Free Services Used

| Service | What For | Cost |
|---|---|---|
| Google Gemini Flash (AI Studio) | AI analysis & reply generation | Free (15 RPM) |
| Chrome Extension APIs | Storage, clipboard, messaging | Free |
| Google Fonts (CDN) | Inter, Outfit, JetBrains Mono | Free |

---

## Commits Log

_(Entries added automatically as commits are made)_
