// ============================================================
// Subtext — Content Script
// ============================================================
// Injected into every page. Creates a Shadow DOM container and
// renders the floating bubble + slide-out analysis panel.
// All UI is fully isolated from the host page.
// ============================================================

(function () {
  'use strict';

  // Prevent double injection
  if (document.getElementById('subtext-root')) return;

  // ---- State ----
  const state = {
    panelOpen: false,
    mode: 'general',
    helpLevel: 3,
    responseStyle: 'balanced',
    context: [],           // { role: 'them'|'you', text: string }[]
    contextOpen: false,
    personInputOpen: false,
    personDescription: '',
    lastAnalysis: null,
    isAnalyzing: false,
    hasApiKey: false,
    toasts: [],
    activeTab: 'analyze',
    isGeneratingOpener: false,
    openerResult: null
  };

  const HELP_LEVEL_DESC = {
    1: 'Analysis only — just tell me what it means',
    2: 'Analysis + 1 reply suggestion',
    3: 'Analysis + 3 reply options with different goals'
  };

  const MAX_MESSAGE_LENGTH = 2000;

  // ---- Create Shadow DOM Container ----
  const host = document.createElement('div');
  host.id = 'subtext-root';
  host.style.cssText = 'all:initial; position:fixed; z-index:2147483647; top:0; left:0; width:0; height:0; pointer-events:none;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // ---- Load Styles ----
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('src/content/content.css') + '?v=' + Date.now();
  shadow.appendChild(styleLink);

  // ---- Load Google Fonts ----
  // Fonts must be loaded in the main document for Shadow DOM to render them
  const fontsUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
  if (!document.querySelector(`link[href*="fonts.googleapis.com"][data-subtext]`)) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = fontsUrl;
    fontLink.setAttribute('data-subtext', 'true');
    document.head.appendChild(fontLink);
  }

  // ---- Toast Container ----
  const toastContainer = document.createElement('div');
  toastContainer.className = 'st-toast-container';
  toastContainer.style.pointerEvents = 'none';
  shadow.appendChild(toastContainer);

  // ---- Build Bubble ----
  const bubble = document.createElement('button');
  bubble.className = 'st-bubble';
  bubble.setAttribute('aria-label', 'Open Mind The Gap analysis panel');
  bubble.style.pointerEvents = 'auto';
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-3 12H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"/>
    </svg>
  `;
  shadow.appendChild(bubble);

  // ---- Build Overlay ----
  const overlay = document.createElement('div');
  overlay.className = 'st-overlay';
  overlay.style.pointerEvents = 'none';
  shadow.appendChild(overlay);

  // ---- Build Panel ----
  const panel = document.createElement('div');
  panel.className = 'st-panel';
  panel.style.pointerEvents = 'auto';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Mind The Gap analysis panel');
  panel.innerHTML = buildPanelHTML();
  shadow.appendChild(panel);

  // ---- Cache DOM refs ----
  let refs = {};
  function cacheRefs() {
    refs = {
      closeBtn: panel.querySelector('.st-panel__close'),
      modeButtons: panel.querySelectorAll('.st-modes__btn'),
      helpButtons: panel.querySelectorAll('.st-help-level__btn'),
      helpDesc: panel.querySelector('.st-help-level__desc'),
      contextHeader: panel.querySelector('.st-context__header'),
      contextBody: panel.querySelector('.st-context__body'),
      contextMessages: panel.querySelector('.st-context__messages'),
      contextCount: panel.querySelector('.st-context__count'),
      contextChevron: panel.querySelector('.st-context__chevron'),
      contextClear: panel.querySelector('.st-context__clear'),
      contextEmpty: panel.querySelector('.st-context__empty'),
      textarea: panel.querySelector('.st-textarea'),
      charCount: panel.querySelector('.st-char-count'),
      personToggle: panel.querySelector('.st-person-toggle'),
      personInput: panel.querySelector('.st-person-input'),
      analyzeBtn: panel.querySelector('.st-analyze-btn'),
      resultsArea: panel.querySelector('#st-results-area'),
      footerSettingsLink: panel.querySelector('.st-panel__footer-link'),
      tabs: panel.querySelectorAll('.st-tabs__btn'),
      tabAnalyze: panel.querySelector('#st-tab-analyze'),
      tabOpeners: panel.querySelector('#st-tab-openers'),
      openerTextarea: panel.querySelector('.st-textarea--opener'),
      openerCharCount: panel.querySelector('.st-char-count-opener'),
      generateBtn: panel.querySelector('.st-generate-btn'),
      openerResultsArea: panel.querySelector('#st-opener-results-area'),
    };
  }

  // ---- Build Panel HTML ----
  function buildPanelHTML() {
    return `
      <!-- Header -->
      <div class="st-panel__header">
        <div class="st-panel__logo">Mind The Gap <span>v0.1</span></div>
        <button class="st-panel__close" aria-label="Close panel">✕</button>
      </div>

      <!-- Body -->
      <div class="st-panel__body">
        <!-- Mode Selector -->
        <div class="st-input-group">
          <div class="st-section-label">Mode</div>
          <div class="st-modes" role="radiogroup" aria-label="Analysis mode">
            <button class="st-modes__btn st-modes__btn--active" data-mode="general" role="radio" aria-checked="true">💬 General</button>
            <button class="st-modes__btn" data-mode="dating" role="radio" aria-checked="false">❤️ Dating</button>
            <button class="st-modes__btn" data-mode="interview" role="radio" aria-checked="false">💼 Interview</button>
          </div>
        </div>

        <!-- Sliding Tabs Navigation -->
        <div class="st-tabs">
          <button class="st-tabs__btn st-tabs__btn--active" data-tab="analyze">🔍 Message Analyzer</button>
          <button class="st-tabs__btn" data-tab="openers">⚡ One-Liners</button>
        </div>

        <!-- Tab Content: Analyze -->
        <div class="st-tab-content" id="st-tab-analyze">
          <!-- Help Level -->
          <div class="st-input-group">
            <div class="st-section-label">Help Level</div>
            <div class="st-help-level">
              <div class="st-help-level__controls" role="radiogroup" aria-label="Help level">
                <button class="st-help-level__btn" data-level="1" role="radio" aria-checked="false">Level 1</button>
                <button class="st-help-level__btn" data-level="2" role="radio" aria-checked="false">Level 2</button>
                <button class="st-help-level__btn st-help-level__btn--active" data-level="3" role="radio" aria-checked="true">Level 3</button>
              </div>
              <div class="st-help-level__desc">${HELP_LEVEL_DESC[3]}</div>
            </div>
          </div>

          <div class="st-divider"></div>

          <!-- Context Thread -->
          <div class="st-context">
            <div class="st-context__header">
              <div class="st-context__title">
                💬 Conversation context <span class="st-context__count">0</span>
              </div>
              <span class="st-context__chevron">▾</span>
            </div>
            <div class="st-context__body">
              <div class="st-context__messages"></div>
              <div class="st-context__empty">No context yet. Analyze a message to start building context.</div>
              <button class="st-context__clear" style="display:none;">Clear context</button>
            </div>
          </div>

          <!-- Message Input -->
          <div class="st-input-group">
            <div class="st-section-label">Message to analyze</div>
            <textarea class="st-textarea" placeholder="Paste the message you received..." maxlength="${MAX_MESSAGE_LENGTH}" rows="3"></textarea>
            <div class="st-textarea-footer">
              <button class="st-person-toggle">+ Add context about this person</button>
              <span class="st-char-count">0 / ${MAX_MESSAGE_LENGTH}</span>
            </div>
            <input class="st-person-input" style="display:none;" type="text" placeholder='e.g. "a girl from Hinge" or "my manager"' />
          </div>

          <!-- Analyze Button -->
          <button class="st-analyze-btn" disabled>
            ✨ Analyze Message
            <span class="st-analyze-btn__shortcut">Ctrl+Enter</span>
          </button>

          <!-- Results Area (dynamic content) -->
          <div id="st-results-area"></div>
        </div>

        <!-- Tab Content: One-Liners -->
        <div class="st-tab-content st-tab-content--hidden" id="st-tab-openers">
          <!-- Opener Input Group -->
          <div class="st-input-group">
            <div class="st-section-label">Who or what is this opener for?</div>
            <textarea class="st-textarea st-textarea--opener" placeholder="e.g., Someone on Hinge who loves hiking and authentic carbonara pasta..." maxlength="${MAX_MESSAGE_LENGTH}" rows="3"></textarea>
            <div class="st-textarea-footer">
              <span class="st-char-count-opener">0 / ${MAX_MESSAGE_LENGTH}</span>
            </div>
          </div>

          <!-- Generate Button -->
          <button class="st-generate-btn" disabled>
            ✨ Generate One-Liners
            <span class="st-generate-btn__shortcut">Ctrl+Enter</span>
          </button>

          <!-- Opener Results Area (dynamic content) -->
          <div id="st-opener-results-area"></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="st-panel__footer">
        <span class="st-panel__footer-text">Built for overthinkers</span>
        <button class="st-panel__footer-link">⚙️ Settings</button>
      </div>
    `;
  }

  // ---- Initialize ----
  cacheRefs();
  loadSettings();
  checkApiKey();
  attachEventListeners();

  // ---- Event Listeners ----
  function attachEventListeners() {
    // Bubble click
    bubble.addEventListener('click', togglePanel);

    // Close button
    refs.closeBtn.addEventListener('click', closePanel);

    // Overlay click
    overlay.addEventListener('click', closePanel);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.panelOpen) {
        closePanel();
      }
    });

    // Mode selector
    refs.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setMode(btn.dataset.mode);
      });
    });

    // Help level
    refs.helpButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setHelpLevel(parseInt(btn.dataset.level));
      });
    });

    // Context toggle
    refs.contextHeader.addEventListener('click', toggleContext);

    // Context clear
    refs.contextClear.addEventListener('click', clearContext);

    // Textarea input
    refs.textarea.addEventListener('input', handleTextareaInput);

    // Textarea paste
    refs.textarea.addEventListener('paste', () => {
      setTimeout(() => handleTextareaInput(), 0);
    });

    // Ctrl+Enter to analyze
    refs.textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!refs.analyzeBtn.disabled && !state.isAnalyzing) {
          analyzeMessage();
        }
      }
    });

    // Person context toggle
    refs.personToggle.addEventListener('click', togglePersonInput);

    // Person input
    if (refs.personInput) {
      refs.personInput.addEventListener('input', (e) => {
        state.personDescription = e.target.value;
      });
    }

    // Analyze button
    refs.analyzeBtn.addEventListener('click', analyzeMessage);

    // Footer settings link
    refs.footerSettingsLink.addEventListener('click', () => {
      if (!isContextValid()) {
        handleContextInvalidated();
        return;
      }
      safeSendMessage({ type: 'OPEN_OPTIONS' });
      // Fallback: try opening options page directly
      if (chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    });

    // Tab switcher binding
    refs.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const selectedTab = tab.dataset.tab;
        if (state.activeTab === selectedTab) return;
        state.activeTab = selectedTab;
        
        refs.tabs.forEach(t => t.classList.toggle('st-tabs__btn--active', t.dataset.tab === selectedTab));
        
        if (selectedTab === 'analyze') {
          refs.tabAnalyze.classList.remove('st-tab-content--hidden');
          refs.tabOpeners.classList.add('st-tab-content--hidden');
        } else {
          refs.tabAnalyze.classList.add('st-tab-content--hidden');
          refs.tabOpeners.classList.remove('st-tab-content--hidden');
        }
      });
    });

    // Opener textarea bindings
    if (refs.openerTextarea) {
      refs.openerTextarea.addEventListener('input', handleOpenerTextareaInput);
      refs.openerTextarea.addEventListener('paste', () => {
        setTimeout(() => handleOpenerTextareaInput(), 0);
      });
      refs.openerTextarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (!refs.generateBtn.disabled && !state.isGeneratingOpener) {
            generateOneLiners();
          }
        }
      });
    }

    // Generate button click binding
    if (refs.generateBtn) {
      refs.generateBtn.addEventListener('click', generateOneLiners);
    }
  }

  // ---- Panel Toggle ----
  function togglePanel() {
    if (state.panelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    state.panelOpen = true;
    panel.classList.add('st-panel--open');
    overlay.classList.add('st-overlay--visible');
    bubble.classList.add('st-bubble--open');
    bubble.classList.add('st-bubble--hidden');
    // Focus textarea
    setTimeout(() => refs.textarea.focus(), 350);
  }

  function closePanel() {
    state.panelOpen = false;
    panel.classList.remove('st-panel--open');
    overlay.classList.remove('st-overlay--visible');
    bubble.classList.remove('st-bubble--open');
    bubble.classList.remove('st-bubble--hidden');
  }

  // ---- Mode ----
  function setMode(mode) {
    state.mode = mode;
    refs.modeButtons.forEach(btn => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('st-modes__btn--active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  // ---- Help Level ----
  function setHelpLevel(level) {
    state.helpLevel = level;
    refs.helpButtons.forEach(btn => {
      const isActive = parseInt(btn.dataset.level) === level;
      btn.classList.toggle('st-help-level__btn--active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
    refs.helpDesc.textContent = HELP_LEVEL_DESC[level];
  }

  // ---- Context Thread ----
  function toggleContext() {
    state.contextOpen = !state.contextOpen;
    refs.contextBody.classList.toggle('st-context__body--open', state.contextOpen);
    refs.contextChevron.classList.toggle('st-context__chevron--open', state.contextOpen);
  }

  function addToContext(role, text) {
    state.context.push({ role, text });
    // Keep max 20 messages
    if (state.context.length > 20) {
      state.context.shift();
    }
    renderContext();
  }

  function clearContext() {
    state.context = [];
    renderContext();
    showToast('Context cleared', 'info');
  }

  function renderContext() {
    const count = state.context.length;
    refs.contextCount.textContent = count;
    refs.contextMessages.innerHTML = '';

    if (count === 0) {
      refs.contextEmpty.style.display = 'block';
      refs.contextClear.style.display = 'none';
    } else {
      refs.contextEmpty.style.display = 'none';
      refs.contextClear.style.display = 'block';

      state.context.forEach(msg => {
        const el = document.createElement('div');
        el.className = `st-context__msg st-context__msg--${msg.role === 'them' ? 'them' : 'you'}`;

        const label = document.createElement('div');
        label.className = 'st-context__msg-label';
        label.textContent = msg.role === 'them' ? 'Them' : 'You';

        const text = document.createElement('div');
        text.textContent = msg.text;

        el.appendChild(label);
        el.appendChild(text);
        refs.contextMessages.appendChild(el);
      });

      // Auto-scroll to bottom
      refs.contextMessages.scrollTop = refs.contextMessages.scrollHeight;
    }
  }

  // ---- Textarea ----
  function handleTextareaInput() {
    const len = refs.textarea.value.length;
    refs.charCount.textContent = `${len} / ${MAX_MESSAGE_LENGTH}`;
    refs.charCount.className = 'st-char-count' +
      (len > MAX_MESSAGE_LENGTH * 0.9 ? ' st-char-count--limit' :
       len > MAX_MESSAGE_LENGTH * 0.75 ? ' st-char-count--warn' : '');

    refs.analyzeBtn.disabled = len === 0 || state.isAnalyzing;
  }

  // ---- Person Input Toggle ----
  function togglePersonInput() {
    state.personInputOpen = !state.personInputOpen;
    refs.personInput.style.display = state.personInputOpen ? 'block' : 'none';
    refs.personToggle.textContent = state.personInputOpen
      ? '- Hide person context'
      : '+ Add context about this person';
    if (state.personInputOpen) {
      refs.personInput.focus();
    }
  }

  // ---- Analyze Message ----
  async function analyzeMessage() {
    if (!isContextValid()) {
      handleContextInvalidated();
      return;
    }
    const message = refs.textarea.value.trim();
    if (!message || state.isAnalyzing) return;

    if (!state.hasApiKey) {
      showSetupCard();
      return;
    }

    state.isAnalyzing = true;
    refs.analyzeBtn.disabled = true;
    refs.analyzeBtn.innerHTML = `<div class="st-analyze-btn__spinner"></div> Analyzing...`;
    refs.analyzeBtn.classList.add('st-analyze-btn--loading');

    // Show loading skeleton
    showLoadingSkeleton();

    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        handleContextInvalidated();
        return;
      }

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'ANALYZE',
          payload: {
            message,
            mode: state.mode,
            helpLevel: state.helpLevel,
            context: state.context,
            personDescription: state.personDescription,
            responseStyle: state.responseStyle
          }
        }, (res) => {
          const err = chrome.runtime.lastError;
          if (err) {
            if (err.message.includes('context invalidated')) {
              handleContextInvalidated();
              reject(new Error('CONTEXT_INVALIDATED'));
            } else {
              reject(err);
            }
          } else {
            resolve(res);
          }
        });
      });

      if (response.type === 'ANALYSIS_RESULT') {
        state.lastAnalysis = response.payload;
        // Add message to context
        addToContext('them', message);
        // Clear textarea
        refs.textarea.value = '';
        handleTextareaInput();
        // Render results
        renderResults(response.payload);
      } else if (response.type === 'ANALYSIS_ERROR') {
        handleAnalysisError(response.payload);
      }
    } catch (error) {
      handleAnalysisError({ error: error.message || 'NETWORK_ERROR', retryable: true });
    } finally {
      state.isAnalyzing = false;
      refs.analyzeBtn.disabled = refs.textarea.value.length === 0;
      refs.analyzeBtn.innerHTML = `✨ Analyze Message <span class="st-analyze-btn__shortcut">Ctrl+Enter</span>`;
      refs.analyzeBtn.classList.remove('st-analyze-btn--loading');
    }
  }

  // ---- Openers Textarea Input Handler ----
  function handleOpenerTextareaInput() {
    const val = refs.openerTextarea.value;
    const len = val.length;
    
    if (refs.openerCharCount) {
      refs.openerCharCount.textContent = `${len} / ${MAX_MESSAGE_LENGTH}`;
    }
    
    refs.generateBtn.disabled = len === 0 || state.isGeneratingOpener;
  }

  // ---- Generate One-Liners ----
  async function generateOneLiners() {
    if (!isContextValid()) {
      handleContextInvalidated();
      return;
    }
    const context = refs.openerTextarea.value.trim();
    if (!context || state.isGeneratingOpener) return;

    if (!state.hasApiKey) {
      showSetupCard();
      return;
    }

    state.isGeneratingOpener = true;
    refs.generateBtn.disabled = true;
    refs.generateBtn.innerHTML = `<div class="st-analyze-btn__spinner"></div> Generating...`;
    refs.generateBtn.classList.add('st-generate-btn--loading');

    // Show skeleton in opener results
    showOpenerSkeleton();

    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        handleContextInvalidated();
        return;
      }

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'GENERATE_OPENER',
          payload: {
            context,
            mode: state.mode
          }
        }, (res) => {
          const err = chrome.runtime.lastError;
          if (err) {
            if (err.message.includes('context invalidated')) {
              handleContextInvalidated();
              reject(new Error('CONTEXT_INVALIDATED'));
            } else {
              reject(err);
            }
          } else {
            resolve(res);
          }
        });
      });

      if (response.type === 'OPENER_RESULT') {
        state.openerResult = response.payload;
        renderOpenerResults(response.payload);
      } else if (response.type === 'OPENER_ERROR') {
        handleOpenerError(response.payload);
      }
    } catch (error) {
      handleOpenerError({ error: error.message || 'NETWORK_ERROR', retryable: true });
    } finally {
      state.isGeneratingOpener = false;
      refs.generateBtn.disabled = refs.openerTextarea.value.length === 0;
      refs.generateBtn.innerHTML = `✨ Generate One-Liners`;
      refs.generateBtn.classList.remove('st-generate-btn--loading');
    }
  }

  // ---- Opener Skeleton Loader ----
  function showOpenerSkeleton() {
    refs.openerResultsArea.innerHTML = `
      <div class="st-skeleton">
        <div class="st-skeleton__section">
          <div class="st-skeleton__bar st-skeleton__bar--short"></div>
          <div class="st-skeleton__bar st-skeleton__bar--long"></div>
        </div>
        <div class="st-skeleton__section">
          <div class="st-skeleton__bar st-skeleton__bar--short"></div>
          <div class="st-skeleton__bar st-skeleton__bar--long"></div>
        </div>
        <div class="st-skeleton__section">
          <div class="st-skeleton__bar st-skeleton__bar--short"></div>
          <div class="st-skeleton__bar st-skeleton__bar--long"></div>
        </div>
      </div>
    `;
  }

  // ---- Render Opener Results ----
  function renderOpenerResults(data) {
    let html = '<div class="st-results st-opener-results">';

    const risks = [
      { key: 'safe', label: 'Safe', badgeClass: 'safe', color: '🟢' },
      { key: 'risky', label: 'Little Risky', badgeClass: 'risky', color: '🟡' },
      { key: 'unhinged', label: 'Unhinged', badgeClass: 'unhinged', color: '🔴' }
    ];

    risks.forEach(risk => {
      const line = data[risk.key] || 'Unable to generate one-liner.';
      html += `
        <div class="st-reply-card st-opener-card">
          <div class="st-reply-card__header">
            <span class="st-risk-badge st-risk-badge--${risk.badgeClass}">
              ${risk.color} ${risk.label}
            </span>
          </div>
          <div class="st-reply-card__text" style="font-family: var(--st-font-primary); font-size: 13.5px; font-weight: 500; margin: 10px 0;">${escapeHtml(line)}</div>
          <div class="st-reply-card__actions">
            <button class="st-reply-card__btn st-reply-card__btn--copy-opener" data-text="${escapeHtml(line)}">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    refs.openerResultsArea.innerHTML = html;
    refs.openerResultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Copy event listener for openers
    refs.openerResultsArea.querySelectorAll('.st-reply-card__btn--copy-opener').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        navigator.clipboard.writeText(text).then(() => {
          showToast('One-liner copied!', 'success');
          const originalText = btn.innerHTML;
          btn.innerHTML = '✓ Copied!';
          btn.style.color = 'var(--st-success)';
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.color = '';
          }, 2000);
        }).catch(() => {
          copyTextFallback(text);
          showToast('One-liner copied!', 'success');
        });
      });
    });
  }

  // ---- Opener Error Handler ----
  function handleOpenerError(payload) {
    const errorMsg = payload.error || 'An error occurred';
    let displayMsg = 'An error occurred while generating one-liners. Please try again.';
    
    if (errorMsg === 'NO_API_KEY') {
      showSetupCard();
      return;
    } else if (errorMsg.startsWith('RATE_LIMITED')) {
      displayMsg = 'Rate limit exceeded. Please wait a few seconds and try again.';
    } else if (errorMsg.startsWith('INVALID_API_KEY')) {
      displayMsg = 'Invalid API key. Please check your extension settings.';
    } else if (errorMsg.startsWith('NETWORK_ERROR')) {
      displayMsg = 'Network error. Please check your internet connection.';
    }

    refs.openerResultsArea.innerHTML = `
      <div class="st-error-card">
        <div class="st-error-card__icon">⚠️</div>
        <div class="st-error-card__message">${escapeHtml(displayMsg)}</div>
        ${payload.retryable ? `<button class="st-error-card__retry st-error-card__retry--opener">Retry</button>` : ''}
      </div>
    `;

    const retryBtn = refs.openerResultsArea.querySelector('.st-error-card__retry--opener');
    if (retryBtn) {
      retryBtn.addEventListener('click', generateOneLiners);
    }
  }

  // ---- Loading Skeleton ----
  function showLoadingSkeleton() {
    refs.resultsArea.innerHTML = `
      <div class="st-skeleton">
        <div class="st-skeleton__section">
          <div class="st-skeleton__bar st-skeleton__bar--medium"></div>
          <div class="st-skeleton__bar st-skeleton__bar--long"></div>
          <div class="st-skeleton__bar st-skeleton__bar--short"></div>
        </div>
        <div class="st-skeleton__section">
          <div class="st-skeleton__bar st-skeleton__bar--short"></div>
          <div class="st-skeleton__bar st-skeleton__bar--long"></div>
          <div class="st-skeleton__bar st-skeleton__bar--full st-skeleton__bar--thin"></div>
        </div>
        <div class="st-skeleton__section">
          <div class="st-skeleton__bar st-skeleton__bar--long"></div>
          <div class="st-skeleton__bar st-skeleton__bar--medium"></div>
        </div>
      </div>
    `;
  }

  // ---- Render Results ----
  function renderResults(data) {
    let html = '<div class="st-results">';

    // Interpretations
    html += `
      <div class="st-result-section">
        <div class="st-result-section__header">
          <span class="st-result-section__icon">🔍</span>
          What this likely means
        </div>
        <div class="st-interpretations">
          ${data.interpretations.map(i => `
            <div class="st-interpretation">
              <div class="st-interpretation__dot st-interpretation__dot--${i.confidence}"></div>
              <div>
                <div>${escapeHtml(i.text)}</div>
                <div class="st-interpretation__confidence">${i.confidence} confidence</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Tone
    html += `
      <div class="st-result-section">
        <div class="st-result-section__header">
          <span class="st-result-section__icon">🎭</span>
          Tone
        </div>
        <div class="st-tone__label">${escapeHtml(data.tone.label)}</div>
        <div class="st-tone__explanation">${escapeHtml(data.tone.explanation)}</div>
        <div class="st-tone__bar-container">
          <span class="st-tone__bar-label">❄️</span>
          <div class="st-tone__bar">
            <div class="st-tone__bar-marker" style="left: ${data.tone.warmth}%"></div>
          </div>
          <span class="st-tone__bar-label">🔥</span>
        </div>
      </div>
    `;

    // Notices (shown at level 2+)
    if (data.notices && data.notices.length > 0 && state.helpLevel >= 2) {
      html += `
        <div class="st-result-section">
          <div class="st-result-section__header">
            <span class="st-result-section__icon">💡</span>
            Things to notice
          </div>
          <div class="st-notices">
            ${data.notices.map(n => `
              <div class="st-notice">
                <span class="st-notice__icon">→</span>
                <span>${escapeHtml(n)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Reply suggestions (conditional on help level)
    if (data.replies && data.replies.length > 0) {
      html += `
        <div class="st-result-section">
          <div class="st-result-section__header">
            <span class="st-result-section__icon">💬</span>
            Suggested ${data.replies.length === 1 ? 'reply' : 'replies'}
          </div>
          <div class="st-replies">
            ${data.replies.map((r, idx) => `
              <div class="st-reply-card">
                <div class="st-reply-card__intent">${escapeHtml(r.intent)}</div>
                <div class="st-reply-card__text">${escapeHtml(r.text)}</div>
                <div class="st-reply-card__rationale">${escapeHtml(r.rationale)}</div>
                <div class="st-reply-card__actions">
                  <button class="st-reply-card__btn st-reply-card__btn--copy" data-reply-idx="${idx}">
                    📋 Copy
                  </button>
                  <button class="st-reply-card__btn st-reply-card__btn--edit" data-reply-idx="${idx}">
                    ✏️ Use & Edit
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Feedback
    html += `
      <div class="st-feedback" id="st-feedback">
        <span>Was this helpful?</span>
        <button class="st-feedback__btn" data-feedback="up" aria-label="Helpful">👍</button>
        <button class="st-feedback__btn" data-feedback="down" aria-label="Not helpful">👎</button>
      </div>
    `;

    html += '</div>';
    refs.resultsArea.innerHTML = html;

    // Attach result event listeners
    attachResultListeners(data);

    // Scroll results into view
    refs.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---- Attach listeners to dynamic result elements ----
  function attachResultListeners(data) {
    // Copy buttons
    refs.resultsArea.querySelectorAll('.st-reply-card__btn--copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.replyIdx);
        const replyText = data.replies[idx]?.text || '';
        try {
          await navigator.clipboard.writeText(replyText);
          btn.innerHTML = '✓ Copied!';
          btn.classList.add('st-reply-card__btn--copied');
          showToast('Reply copied to clipboard!', 'success');
          setTimeout(() => {
            btn.innerHTML = '📋 Copy';
            btn.classList.remove('st-reply-card__btn--copied');
          }, 2000);
        } catch {
          // Fallback
          copyTextFallback(replyText);
          btn.innerHTML = '✓ Copied!';
          btn.classList.add('st-reply-card__btn--copied');
          showToast('Reply copied to clipboard!', 'success');
          setTimeout(() => {
            btn.innerHTML = '📋 Copy';
            btn.classList.remove('st-reply-card__btn--copied');
          }, 2000);
        }
      });
    });

    // Edit buttons
    refs.resultsArea.querySelectorAll('.st-reply-card__btn--edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.replyIdx);
        const replyText = data.replies[idx]?.text || '';
        // Add to context as "your reply"
        addToContext('you', replyText);
        // Put in textarea for editing
        refs.textarea.value = replyText;
        handleTextareaInput();
        refs.textarea.focus();
        showToast('Reply loaded — edit and send!', 'info');
      });
    });

    // Feedback buttons
    refs.resultsArea.querySelectorAll('.st-feedback__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const helpful = btn.dataset.feedback === 'up';
        safeSendMessage({
          type: 'SAVE_FEEDBACK',
          payload: { helpful, timestamp: Date.now() }
        });
        const feedbackEl = refs.resultsArea.querySelector('#st-feedback');
        if (feedbackEl) {
          feedbackEl.innerHTML = `<span class="st-feedback__thanks">Thanks for the feedback! 🙏</span>`;
        }
      });
    });
  }

  // ---- Error Handling ----
  function handleAnalysisError(error) {
    const errMsg = error.error || '';
    if (errMsg.includes('context invalidated') || errMsg === 'CONTEXT_INVALIDATED') {
      handleContextInvalidated();
      return;
    }

    const errorMessages = {
      'NO_API_KEY': { icon: '🔮', message: 'No API key found. Set up your free Gemini API key in Settings to get started.', showSetup: true },
      'INVALID_API_KEY': { icon: '⚠️', message: 'Invalid API key. Please check your extension settings.', showSetup: false },
      'RATE_LIMITED': { icon: '⏳', message: 'Too many requests. The free tier allows 15 per minute. Please wait a moment and try again.', showSetup: false },
      'NETWORK_ERROR': { icon: '📡', message: 'Couldn\'t reach the AI service. Please check your internet connection and try again.', showSetup: false },
      'PARSE_ERROR': { icon: '🔧', message: 'Something went wrong processing the response. Please try again.', showSetup: false },
    };

    const errorKey = Object.keys(errorMessages).find(key => errMsg.startsWith(key));
    const errInfo = errorMessages[errorKey] || { icon: '❌', message: 'Something went wrong. Please try again.', showSetup: false };

    if (errInfo.showSetup) {
      showSetupCard();
      return;
    }

    refs.resultsArea.innerHTML = `
      <div class="st-error-card">
        <div class="st-error-card__icon">${errInfo.icon}</div>
        <div class="st-error-card__message">${errInfo.message}</div>
        ${error.retryable 
          ? '<button class="st-error-card__retry">Try again</button>' 
          : '<button class="st-error-card__retry st-error-card__open-settings" style="margin-top: 15px;">⚙️ Open Settings</button>'
        }
      </div>
    `;

    const retryBtn = refs.resultsArea.querySelector('.st-error-card__retry');
    if (retryBtn) {
      if (retryBtn.classList.contains('st-error-card__open-settings')) {
        retryBtn.addEventListener('click', () => {
          chrome.runtime.openOptionsPage?.();
        });
      } else {
        retryBtn.addEventListener('click', analyzeMessage);
      }
    }
  }

  // ---- Setup Card (no API key) ----
  function showSetupCard() {
    refs.resultsArea.innerHTML = `
      <div class="st-setup-card">
        <div class="st-setup-card__icon">🔮</div>
        <div class="st-setup-card__title">Welcome to Mind The Gap!</div>
        <div class="st-setup-card__desc">
          To get started, you'll need a free Gemini API key from Google AI Studio. It takes 30 seconds and costs nothing.
        </div>
        <button class="st-setup-card__btn" id="st-open-settings">⚙️ Open Settings</button>
        <a class="st-setup-card__link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">
          Get a free API key from Google AI Studio →
        </a>
      </div>
    `;

    refs.resultsArea.querySelector('#st-open-settings')?.addEventListener('click', () => {
      chrome.runtime.openOptionsPage?.();
    });
  }

  // ---- Toast Notifications ----
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `st-toast st-toast--${type}`;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${escapeHtml(message)}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('st-toast--exiting');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ---- Load Settings ----
  function loadSettings() {
    safeSendMessage({ type: 'GET_SETTINGS' }, (response) => {
      if (response && response.payload) {
        const s = response.payload;
        setMode(s.defaultMode || 'general');
        if (s.defaultHelpLevel) setHelpLevel(parseInt(s.defaultHelpLevel));
        if (s.responseStyle) state.responseStyle = s.responseStyle;
      } else {
        setMode('general');
      }
    });
  }

  // ---- Check API Key ----
  function checkApiKey() {
    safeSendMessage({ type: 'CHECK_API_KEY' }, (response) => {
      if (response && response.payload) {
        state.hasApiKey = response.payload.hasKey;
      }
    });
  }

  // ---- Utility: Escape HTML ----
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ---- Utility: Clipboard Fallback ----
  function copyTextFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(textarea);
  }

  // ---- Robust Message Wrapper with Context Invalidation Handling ----
  function isContextValid() {
    try {
      return !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.runtime.getManifest());
    } catch (e) {
      return false;
    }
  }

  function safeSendMessage(message, callback) {
    if (!isContextValid()) {
      handleContextInvalidated();
      return;
    }
    try {
      chrome.runtime.sendMessage(message, (response) => {
        const err = chrome.runtime.lastError;
        if (err) {
          if (err.message.includes('context invalidated')) {
            handleContextInvalidated();
          } else {
            console.error('Extension error:', err);
          }
          return;
        }
        if (callback) callback(response);
      });
    } catch (e) {
      if (e.message.includes('context invalidated')) {
        handleContextInvalidated();
      } else {
        console.error('Runtime exception:', e);
      }
    }
  }

  function handleContextInvalidated() {
    showToast('Mind The Gap has been reloaded. Please refresh the page!', 'error');
    if (refs.resultsArea) {
      refs.resultsArea.innerHTML = `
        <div class="st-error-card">
          <div class="st-error-card__icon">🔄</div>
          <div class="st-error-card__message" style="margin-top: 10px;">
            Mind The Gap has been updated or reloaded in Developer mode. Please refresh this page to continue!
          </div>
          <button class="st-error-card__retry" style="margin-top: 15px;" onclick="window.location.reload()">Refresh Page</button>
        </div>
      `;
    }
  }

  // ---- Listen for messages from popup/background ----
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_PANEL') {
      togglePanel();
    }
  });

  // ---- Listen for settings changes ----
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.apiKey) {
        state.hasApiKey = !!changes.apiKey.newValue;
      }
      if (changes.defaultMode) {
        setMode(changes.defaultMode.newValue);
      }
      if (changes.defaultHelpLevel) {
        setHelpLevel(parseInt(changes.defaultHelpLevel.newValue));
      }
      if (changes.responseStyle) {
        state.responseStyle = changes.responseStyle.newValue;
      }
    }
  });

})();
