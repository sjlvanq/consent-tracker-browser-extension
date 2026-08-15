Generate the source code for a Minimum Viable Product (MVP) of a Google Chrome extension (Manifest V3) named "ConsentTracker". The architecture requires a background service worker, a persistent storage module, and a configuration interface.

Functional Requirements:
1. Event Monitoring: Intercept navigation events to capture the active URL and the document title once the page load is complete.
2. Filtering Logic: Evaluate captured URLs against two configurable sets of domain rules: a whitelist (explicitly tracked domains) and a blacklist (excluded domains). The telemetry execution must abort if the URL matches the blacklist or fails to match an entry in the whitelist.
3. State Management: Utilize the chrome.storage API to persist the application state. The state vector must include: the target API endpoint (URI), the whitelist, the blacklist, and a unique user identifier.
4. Identifier Initialization: During the initial installation lifecycle event, generate a random user identifier (e.g., UUIDv4 or a cryptographically secure random string) and persist it.
5. Data Transmission: Dispatch an asynchronous HTTP POST request to the configured API endpoint. The request must transmit a JSON payload adhering to the following schema: { "userId": string, "url": string, "title": string, "timestamp": string (ISO 8601) }.
6. Configuration Interface: Implement an Options page (or Popup) allowing the user to configure the endpoint URI, modify the whitelist and blacklist arrays, and inspect or regenerate the random user identifier.

Technical Constraints:
- All variable names, constant names, function declarations, and inline code comments must be written strictly in English.
- Implement non-blocking asynchronous operations for the network requests (fetch API) to prevent degradation of the browser's main thread.
- Provide the complete code for the following components: manifest.json, background.js (service worker), options.html (or popup.html), and options.js (or popup.js).
