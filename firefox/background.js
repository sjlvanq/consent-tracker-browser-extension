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

// Initialize or load the application state
async function initializeState() {
  const result = await browser.storage.local.get(['apiEndpoint', 'whitelist', 'blacklist', 'userId']);
  
  // Generate userId if it doesn't exist
  if (!result.userId) {
    const newUserId = generateUserId();
    await browser.storage.local.set({ userId: newUserId });
    result.userId = newUserId;
  }
  
  return {
    apiEndpoint: result.apiEndpoint || DEFAULT_STATE.apiEndpoint,
    whitelist: result.whitelist || DEFAULT_STATE.whitelist,
    blacklist: result.blacklist || DEFAULT_STATE.blacklist,
    userId: result.userId
  };
}

// Extract domain from URL for filtering
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return null;
  }
}

// Check if URL matches any pattern in the list
function matchesPattern(url, patterns) {
  const domain = extractDomain(url);
  if (!domain) return false;
  
  return patterns.some(pattern => {
    // Support both exact domain matches and wildcard patterns
    if (pattern === '*') return true;
    if (pattern.startsWith('*.')) {
      const baseDomain = pattern.slice(2);
      return domain === baseDomain || domain.endsWith('.' + baseDomain);
    }
    return domain === pattern || url.includes(pattern);
  });
}

// Filter URL based on whitelist and blacklist rules
function shouldTrackUrl(url, whitelist, blacklist) {
  // Abort if URL matches blacklist
  if (matchesPattern(url, blacklist)) {
    return false;
  }
  
  // If whitelist is empty, track all URLs (except blacklist)
  if (whitelist.length === 0) {
    return true;
  }
  
  // Track only if URL matches whitelist
  return matchesPattern(url, whitelist);
}

// Send telemetry data to the configured API endpoint
async function sendTelemetry(apiEndpoint, payload) {
  if (!apiEndpoint) {
    console.warn('API endpoint not configured, skipping telemetry');
    return;
  }
  
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Telemetry request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending telemetry:', error);
  }
}

// Handle navigation completion events
browser.webNavigation.onCompleted.addListener(async (details) => {
  console.log('Navigation event detected:', details.url);
  
  // Only process main frame navigation
  if (details.frameId !== 0) {
    console.log('Skipping: not main frame (frameId:', details.frameId + ')');
    return;
  }
  
  // Skip non-HTTP protocols (chrome://, about:, etc.)
  if (!details.url.startsWith('http://') && !details.url.startsWith('https://')) {
    console.log('Skipping: non-HTTP protocol');
    return;
  }
  
  const state = await initializeState();
  console.log('Current state:', state);
  
  // Apply filtering logic
  if (!shouldTrackUrl(details.url, state.whitelist, state.blacklist)) {
    console.log('Skipping: URL filtered by whitelist/blacklist');
    return;
  }
  
  console.log('Tracking URL:', details.url);
  
  // Get the tab to fetch the page title
  let pageTitle = '';
  try {
    const tab = await browser.tabs.get(details.tabId);
    pageTitle = tab.title || '';
    console.log('Page title:', pageTitle);
  } catch (error) {
    console.error('Error getting tab title:', error);
  }
  
  // Prepare telemetry payload
  const payload = {
    userId: state.userId,
    url: details.url,
    title: pageTitle,
    timestamp: new Date().toISOString()
  };
  
  console.log('Sending payload:', payload);
  
  // Send telemetry asynchronously (non-blocking)
  sendTelemetry(state.apiEndpoint, payload);
});

// Handle extension installation
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const newUserId = generateUserId();
    await browser.storage.local.set({ 
      userId: newUserId,
      apiEndpoint: DEFAULT_STATE.apiEndpoint,
      whitelist: DEFAULT_STATE.whitelist,
      blacklist: DEFAULT_STATE.blacklist
    });
    console.log('ConsentTracker installed with userId:', newUserId);
  }
});