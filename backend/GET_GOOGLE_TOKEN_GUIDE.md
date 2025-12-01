# Get Google Refresh Token - Quick Guide

## 🚀 Quick Start

Run this command to get your Google refresh token:

```bash
cd backend
node get-google-token.js
```

## 📋 What This Does

1. ✅ Starts a local server on port 3002
2. ✅ Opens your browser to Google's OAuth page
3. ✅ You login and grant permissions
4. ✅ Google redirects back with authorization code
5. ✅ Script exchanges code for refresh token
6. ✅ Displays your refresh token in terminal

## 📝 Step-by-Step Instructions

### Step 1: Run the Script

```bash
cd backend
node get-google-token.js
```

### Step 2: Authenticate in Browser

- Browser opens automatically (or copy the URL shown)
- Login to your Google account
- Select the Google My Business account
- Click "Allow" to grant permissions

### Step 3: Copy the Refresh Token

You'll see output like:

```
✅ SUCCESS! Your tokens:
======================================================================

📝 REFRESH TOKEN (add this to your .env file):

GOOGLE_REFRESH_TOKEN=1//0gABCDEF123456...
```

### Step 4: Update .env File

1. Open `backend/.env`
2. Find the line: `GOOGLE_REFRESH_TOKEN=your_refresh_token_here`
3. Replace with: `GOOGLE_REFRESH_TOKEN=1//0gABCDEF123456...`
4. Save the file

### Step 5: Test It

```bash
# Test the Google My Business integration
node examples/googleMyBusinessExample.js
```

## ⚠️ Troubleshooting

### Browser Doesn't Open?

Copy the URL from terminal and paste in your browser:

```
https://accounts.google.com/o/oauth2/auth?client_id=...
```

### Port 3002 Already in Use?

Stop your main server first:

```bash
# Find process using port 3002
netstat -ano | findstr :3002

# Kill the process (use the PID from above)
taskkill /PID <PID> /F
```

### "Access denied" Error?

Make sure you:

1. Have a Google My Business account
2. Are logged into the correct Google account
3. Have Google My Business API enabled in Google Cloud Console

### No Refresh Token Received?

If you only get an access token but no refresh token:

1. Go to: https://myaccount.google.com/permissions
2. Remove "SEO Health Analyzer" app access
3. Run the script again
4. Make sure to grant permissions again

## 🔑 Your Current Credentials

From your `.env` file:

```
GOOGLE_CLIENT_ID=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmb/callback
```

These are already configured in the script!

## 📖 Alternative Method (Manual)

If the script doesn't work, you can do it manually:

1. **Generate Auth URL**: Open this in your browser:

```
https://accounts.google.com/o/oauth2/auth?client_id=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com&redirect_uri=http://localhost:3002/api/gmb/callback&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent
```

2. **Get Authorization Code**: After authentication, you'll be redirected to:

```
http://localhost:3002/api/gmb/callback?code=AUTHORIZATION_CODE_HERE
```

3. **Exchange Code for Token**: Use curl or Postman:

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "code=AUTHORIZATION_CODE_HERE" \
  -d "client_id=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com" \
  -d "client_secret=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" \
  -d "redirect_uri=http://localhost:3002/api/gmb/callback" \
  -d "grant_type=authorization_code"
```

4. **Get Refresh Token**: The response will contain:

```json
{
  "access_token": "...",
  "refresh_token": "1//0g...",
  "expires_in": 3599,
  "token_type": "Bearer"
}
```

## ✅ Done!

Once you have your refresh token in the `.env` file, you can use all Google My Business API features!

Test it with:

```bash
node examples/googleMyBusinessExample.js
```
