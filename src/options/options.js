// ============================================================
// Subtext — Options Page Script
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key-input');
  const toggleVisBtn = document.getElementById('toggle-key-visibility');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const keyStatus = document.getElementById('key-status');
  const savePrefsBtn = document.getElementById('save-prefs-btn');
  const prefsStatus = document.getElementById('prefs-status');
  const clearDataBtn = document.getElementById('clear-data-btn');

  let keyVisible = false;

  // ---- Load saved settings ----
  chrome.storage.sync.get(['apiKey', 'defaultMode', 'defaultHelpLevel', 'responseStyle'], (settings) => {
    if (settings.apiKey) {
      apiKeyInput.value = settings.apiKey;
      showStatus(keyStatus, '✓ API key is saved', 'success');
    } else {
      // Check if background is connected to server or hardcoded key
      chrome.runtime.sendMessage({ type: 'CHECK_API_KEY' }, (response) => {
        if (response && response.payload && response.payload.isHardcoded) {
          apiKeyInput.placeholder = 'Using Shared AI Server backend (Key Secured)';
          showStatus(keyStatus, '✓ Connected to secure Shared AI Server backend', 'success');
        }
      });
    }

    if (settings.defaultMode) {
      const radio = document.querySelector(`input[name="mode"][value="${settings.defaultMode}"]`);
      if (radio) radio.checked = true;
    }

    if (settings.defaultHelpLevel) {
      const radio = document.querySelector(`input[name="level"][value="${settings.defaultHelpLevel}"]`);
      if (radio) radio.checked = true;
    }

    if (settings.responseStyle) {
      const radio = document.querySelector(`input[name="style"][value="${settings.responseStyle}"]`);
      if (radio) radio.checked = true;
    }
  });

  // ---- Toggle API key visibility ----
  toggleVisBtn.addEventListener('click', () => {
    keyVisible = !keyVisible;
    apiKeyInput.type = keyVisible ? 'text' : 'password';
    toggleVisBtn.textContent = keyVisible ? '🙈' : '👁️';
  });

  // ---- Save API Key ----
  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      showStatus(keyStatus, '✕ Please enter an API key', 'error');
      return;
    }

    chrome.storage.sync.set({ apiKey: key }, () => {
      showStatus(keyStatus, '✓ API key saved successfully!', 'success');
      // Flash the button
      saveKeyBtn.textContent = '✓ Saved!';
      setTimeout(() => { saveKeyBtn.textContent = 'Save API Key'; }, 2000);
    });
  });

  // ---- Save Preferences ----
  savePrefsBtn.addEventListener('click', () => {
    const mode = document.querySelector('input[name="mode"]:checked')?.value || 'general';
    const level = document.querySelector('input[name="level"]:checked')?.value || '3';
    const style = document.querySelector('input[name="style"]:checked')?.value || 'balanced';

    chrome.storage.sync.set({
      defaultMode: mode,
      defaultHelpLevel: parseInt(level),
      responseStyle: style
    }, () => {
      showStatus(prefsStatus, '✓ Preferences saved!', 'success');
      savePrefsBtn.textContent = '✓ Saved!';
      setTimeout(() => { savePrefsBtn.textContent = 'Save Preferences'; }, 2000);
    });
  });

  // ---- Clear All Data ----
  clearDataBtn.addEventListener('click', () => {
    const confirmed = confirm(
      'Are you sure you want to clear all Mind The Gap data?\n\n' +
      'This will delete your API key, preferences, and all analysis history. ' +
      'This cannot be undone.'
    );

    if (confirmed) {
      chrome.storage.sync.clear(() => {
        chrome.storage.local.clear(() => {
          apiKeyInput.value = '';
          document.querySelector('input[name="mode"][value="general"]').checked = true;
          document.querySelector('input[name="level"][value="3"]').checked = true;
          document.querySelector('input[name="style"][value="balanced"]').checked = true;
          showStatus(keyStatus, '', '');
          showStatus(prefsStatus, '', '');

          clearDataBtn.textContent = '✓ All data cleared';
          clearDataBtn.style.borderColor = 'hsl(152, 68%, 50%)';
          clearDataBtn.style.color = 'hsl(152, 68%, 50%)';
          setTimeout(() => {
            clearDataBtn.textContent = 'Clear All Data';
            clearDataBtn.style.borderColor = '';
            clearDataBtn.style.color = '';
          }, 2500);
        });
      });
    }
  });

  // ---- Utility ----
  function showStatus(el, message, type) {
    el.textContent = message;
    el.className = 'options__status' + (type ? ` options__status--${type}` : '');
  }
});
