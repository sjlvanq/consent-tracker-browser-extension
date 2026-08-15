# ConsentTracker

A browser extension that tracks user navigation events with configurable domain filtering.

## Features

- Intercepts navigation events to capture URL and page title
- Configurable whitelist and blacklist for domain filtering
- Persistent storage for configuration and user identifier
- Sends tracking data to a configurable API endpoint
- Options page for configuration management

## Installation

### Chrome/Chromium
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome/` directory

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `firefox/manifest.json` file

## Configuration

Access the options page to configure:
- API endpoint URI
- Whitelist and blacklist domains
- User identifier (auto-generated on install, can be regenerated)

## Data Schema

Tracked events are sent as JSON:
```json
{
  "userId": "string",
  "url": "string",
  "title": "string",
  "timestamp": "ISO 8601 string"
}
```
