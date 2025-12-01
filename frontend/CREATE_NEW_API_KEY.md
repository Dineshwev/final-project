# Instructions to Create a New Firebase API Key

## Step 1: Create a New API Key
1. Go to: https://console.cloud.google.com/apis/credentials?project=health-4c77c
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "API key"
4. Copy the new API key

## Step 2: Configure the New API Key
1. Click "RESTRICT KEY" on the popup (or edit the key later)
2. Give it a name: "Firebase Web Authentication Key"
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: http://localhost:3000/*
   - Add: http://localhost:*
   - Add your production domain when ready
4. Under "API restrictions":
   - Select "Don't restrict key" (RECOMMENDED FOR NOW)
   - OR select "Restrict key" and add ONLY these APIs:
     * Identity Toolkit API
     * Token Service API
5. Click "SAVE"

## Step 3: Update Your .env File
Replace the REACT_APP_FIREBASE_API_KEY with your new key:
REACT_APP_FIREBASE_API_KEY=your_new_unrestricted_api_key_here

## Step 4: Restart Your Dev Server
Stop the server (Ctrl+C) and run: npm start

---

Note: For development, it's easiest to use "Don't restrict key"
For production, you should restrict to specific APIs and domains.
