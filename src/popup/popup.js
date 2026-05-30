// ============================================================
// Subtext — Popup Script
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const apiStatus = document.getElementById('api-status');
  const openPanelBtn = document.getElementById('open-panel-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const modeButtons = document.querySelectorAll('.popup__mode-btn');
  const levelButtons = document.querySelectorAll('.popup__level-btn');

  // ---- Load current settings ----
  chrome.storage.sync.get(['defaultMode', 'defaultHelpLevel'], (settings) => {
    // Mode
    const activeMode = settings.defaultMode || 'general';
    modeButtons.forEach(btn => {
      btn.classList.toggle('popup__mode-btn--active', btn.dataset.mode === activeMode);
    });

    // Help level
    if (settings.defaultHelpLevel) {
      levelButtons.forEach(btn => {
        btn.classList.toggle('popup__level-btn--active', btn.dataset.level === String(settings.defaultHelpLevel));
      });
    }
  });

  chrome.runtime.sendMessage({ type: 'CHECK_API_KEY' }, (response) => {
    const hasKey = response && response.payload && response.payload.hasKey;
    const isHardcoded = response && response.payload && response.payload.isHardcoded;
    if (hasKey) {
      apiStatus.innerHTML = `
        <span class="popup__status-dot popup__status-dot--ok"></span>
        <span class="popup__status-text">${isHardcoded ? 'Connected to AI Server' : 'API key configured'}</span>
      `;
    } else {
      apiStatus.innerHTML = `
        <span class="popup__status-dot popup__status-dot--error"></span>
        <span class="popup__status-text">API key missing</span>
        <button class="popup__status-link" id="setup-key-btn">Set up →</button>
      `;
      document.getElementById('setup-key-btn')?.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });
    }
  });

  // ---- Mode switching ----
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('popup__mode-btn--active'));
      btn.classList.add('popup__mode-btn--active');
      chrome.storage.sync.set({ defaultMode: btn.dataset.mode });
    });
  });

  // ---- Level switching ----
  levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      levelButtons.forEach(b => b.classList.remove('popup__level-btn--active'));
      btn.classList.add('popup__level-btn--active');
      chrome.storage.sync.set({ defaultHelpLevel: parseInt(btn.dataset.level) });
    });
  });

  // ---- Open panel on current page ----
  openPanelBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
      window.close();
    }
  });

  // ---- Settings ----
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
