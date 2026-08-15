// Default configuration state
const DEFAULT_STATE = {
  apiEndpoint: '',
  whitelist: [],
  blacklist: [],
  userId: null
};

// Generate a cryptographically secure random identifier
function generateUserId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hexArray = Array.from(array, byte => byte.toString(16).padStart(2, '0'));
  return hexArray.join('');
}

// Convert array to textarea format (one item per line)
function arrayToTextarea(array) {
  return array.join('\n').trim();
}

// Convert textarea content to array (split by lines, filter empty)
function textareaToArray(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Load current settings from storage and populate form fields
async function loadSettings() {
  const result = await chrome.storage.local.get(['apiEndpoint', 'whitelist', 'blacklist', 'userId']);
  
  document.getElementById('apiEndpoint').value = result.apiEndpoint || DEFAULT_STATE.apiEndpoint;
  document.getElementById('whitelist').value = arrayToTextarea(result.whitelist || DEFAULT_STATE.whitelist);
  document.getElementById('blacklist').value = arrayToTextarea(result.blacklist || DEFAULT_STATE.blacklist);
  document.getElementById('userId').value = result.userId || '';
}

// Save form settings to storage
async function saveSettings() {
  const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
  const whitelist = textareaToArray(document.getElementById('whitelist').value);
  const blacklist = textareaToArray(document.getElementById('blacklist').value);
  
  await chrome.storage.local.set({
    apiEndpoint,
    whitelist,
    blacklist
  });
  
  showStatusMessage('Settings saved successfully!', 'success');
}

// Reset all settings to defaults
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    return;
  }
  
  const currentUserId = document.getElementById('userId').value;
  
  await chrome.storage.local.set({
    apiEndpoint: DEFAULT_STATE.apiEndpoint,
    whitelist: DEFAULT_STATE.whitelist,
    blacklist: DEFAULT_STATE.blacklist,
    userId: currentUserId // Preserve user ID
  });
  
  // Reload form with default values
  await loadSettings();
  showStatusMessage('Settings reset to defaults (user ID preserved).', 'success');
}

// Regenerate the user identifier
async function regenerateUserId() {
  if (!confirm('Are you sure you want to regenerate your user ID? This will create a new identity for tracking purposes.')) {
    return;
  }
  
  const newUserId = generateUserId();
  await chrome.storage.local.set({ userId: newUserId });
  
  document.getElementById('userId').value = newUserId;
  showStatusMessage('User ID regenerated successfully!', 'success');
}

// Display status message to user
function showStatusMessage(message, type) {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  statusElement.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  // Load current settings
  await loadSettings();
  
  // Set up event listeners
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
  document.getElementById('regenerateUserId').addEventListener('click', regenerateUserId);
  
  // Ensure user ID exists on first load
  const result = await chrome.storage.local.get(['userId']);
  if (!result.userId) {
    const newUserId = generateUserId();
    await chrome.storage.local.set({ userId: newUserId });
    document.getElementById('userId').value = newUserId;
  }
});
