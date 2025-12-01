# Healthy SEO Application

A comprehensive SEO analysis tool that helps you analyze and improve your website's health, performance, and search engine optimization.

## Features

- Website SEO analysis
- Performance metrics
- Security scanning
- Technical SEO recommendations
- User authentication (Email/Password and Google)
- Report generation
- History tracking
- Broken link checker (advanced: headless, robots.txt respect, proxies, retries)
- Schema markup validator (JSON-LD, Microdata, RDFa extraction with optional headless rendering)
- Content quality analyzer
- Competitor comparison tool
- Rank tracker (SERP position scraping, alerts, history charting, CSV export)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python (for running the frontend server)
- NPM (Node Package Manager)

### Environment Variables

Both the frontend and backend use environment variables stored in `.env` files to keep sensitive information secure.

#### Backend Environment Variables

Create or update the file `backend/.env` with the following content:

```
# API Keys for SEO Services
PAGE_SPEED_INSIGHTS_API_KEY=your_pagespeed_api_key
WHOAPI_KEY=your_whoapi_key
SAFE_BROWSING_API_KEY=your_safe_browsing_api_key

# Server Configuration
PORT=3002
NODE_ENV=development

# Database Configuration
DB_PATH=./data/scans.db

# Rank Tracker & Scheduler
# Optional: comma-separated proxy URLs for SERP fetching (http://user:pass@host:port)
RANK_PROXIES=
# Max concurrent SERP fetch workers (1-5)
RANK_MAX_CONCURRENCY=3
# Cron expression for daily rank refresh (default midnight).
RANK_REFRESH_CRON=0 0 * * *
# Random jitter (minutes) added before refresh to spread load
RANK_REFRESH_JITTER_MINUTES=20
```

#### Frontend Environment Variables

Create or update the file `frontand/.env` with the following content:

```
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# API Base (override if backend runs on another port)
REACT_APP_API_BASE_URL=http://localhost:3003/api
```

### Installation

1. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

   If you added proxy rotation: ensure `https-proxy-agent` is installed (already in package.json).

2. Install frontend dependencies:
   ```
   cd frontand
   npm install
   ```

   If Rank Tracker page fails to start after adding new features, delete `node_modules` and reinstall.

### Starting the Application

You can use the included PowerShell script to start both servers with the correct environment variables:

```
powershell -ExecutionPolicy Bypass -File .\start-servers.ps1
```

Or manually:

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the frontend server:
   ```
   cd frontand
   npm start
   ```

3. Access the application at `http://localhost:8080`

   If using React dev server and backend on different port (e.g. 3003), ensure `REACT_APP_API_BASE_URL` matches.

### Rank Tracker Usage

1. Navigate to Rank Tracker page.
2. Add a keyword + the exact URL whose position you want to track.
3. Click Refresh (single) or Refresh All to fetch current Google SERP position (top 20 results sampled).
4. History chart displays position trends (lower number = better rank). Use date filters & pagination for large histories.
5. Alerts are generated when rank changes by 5 or more positions between successive successful fetches. Export alerts/history as CSV.

Notes:
- SERP scraping uses randomized delays, rotating user agents, optional proxies, and limited concurrency to reduce blocks.
- If a result isn't found in the first 20 organic listings or a block occurs, position is recorded as null (no alert created).
- For production or higher volume, consider swapping to a compliant SERP API provider via an abstraction layer.

### Advanced Crawler/Validator Features

- Link Checker: supports depth limits, max pages, headless rendering, proxy, custom headers, cookies, robots.txt respect, stealth.
- Schema Validator: headless option with similar proxy/header/cookie controls; returns suggestions when blocked.

### New CSV Endpoints

Backend endpoints (GET):
- `/api/rank-tracker/:id/history/export.csv?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `/api/rank-tracker/alerts/export.csv`

### Pagination & Filtering

Keywords: `/api/rank-tracker?page=1&pageSize=20&search=partial`

History: `/api/rank-tracker/:id/history?page=1&pageSize=50&from=YYYY-MM-DD&to=YYYY-MM-DD`

Responses include: `items`, `total`, `page`, `pageSize`.

### Environment Variable Summary (New)

| Variable | Description |
|----------|-------------|
| RANK_PROXIES | Comma-separated proxy URLs for SERP fetches (optional) |
| RANK_MAX_CONCURRENCY | Max concurrent rank fetch workers (1-5) |
| RANK_REFRESH_CRON | Cron schedule for daily rank refresh task |
| RANK_REFRESH_JITTER_MINUTES | Random delay (minutes) before daily refresh |
| REACT_APP_API_BASE_URL | Frontend API base override |

### Troubleshooting Rank Tracker

- Position always null: Google blocked request or URL not in top 20 results. Add proxies or reduce concurrency.
- Many alerts missing: Alerts only fire if absolute delta >= 5 and both old/new positions are non-null.
- CSV empty: Ensure history exists; positions populate only after successful refresh operations.
- React dev error after updates: Restart dev server; clear browser cache; reinstall dependencies if needed.

## Security Notes

- Never commit `.env` files to version control
- Always use environment variables for API keys and credentials
- Keep Firebase configuration secure

## Troubleshooting

If you encounter issues with the Google sign-in:

1. Make sure you've enabled Google Authentication in your Firebase project
2. Verify that the Firebase configuration is correct
3. Check that the domain you're running on is authorized in Firebase Authentication settings