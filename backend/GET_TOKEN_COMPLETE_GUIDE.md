# 🔑 Get Google Refresh Token - Complete Guide

## ⚠️ IMPORTANT: Add Redirect URI First

Before running the script, you MUST add the new redirect URI to Google Cloud Console:

### Step 1: Add Redirect URI to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8`
3. Click on it to edit
4. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3005/callback
   ```
5. Click "Save"

**Current Redirect URIs** (make sure both are added):

- `http://localhost:3002/api/gmb/callback` (for your main app)
- `http://localhost:3005/callback` (for token generator)

---

## 🚀 Method 1: Automated Script (Easiest)

### Run the Script:

```bash
cd backend
node get-google-token.js
```

### What Happens:

1. ✅ Browser opens automatically
2. ✅ You login to Google
3. ✅ Grant permissions
4. ✅ Refresh token displays in terminal
5. ✅ Copy token to `.env` file

---

## 🌐 Method 2: Manual Browser Method (If Script Fails)

### Step 1: Open This URL in Your Browser

**OPTION A - Using Token Generator Port (3005)**:

```
https://accounts.google.com/o/oauth2/auth?client_id=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com&redirect_uri=http://localhost:3005/callback&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent
```

**OPTION B - Using Main Server Port (3002)** (if server is running):

```
https://accounts.google.com/o/oauth2/auth?client_id=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com&redirect_uri=http://localhost:3002/api/gmb/callback&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent
```

### Step 2: Authenticate

- Login to your Google account
- Select your Google My Business account
- Click "Allow" to grant permissions

### Step 3: Copy Authorization Code

After authentication, you'll be redirected to a URL like:

```
http://localhost:3005/callback?code=4/0AVG7fiQ9X...
```

Copy the code after `code=`

### Step 4: Exchange Code for Token

Open PowerShell and run:

```powershell
$code = "PASTE_YOUR_CODE_HERE"

$body = @{
    code = $code
    client_id = "679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com"
    client_secret = "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"
    redirect_uri = "http://localhost:3005/callback"
    grant_type = "authorization_code"
}

$response = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body

Write-Host "`n✅ SUCCESS! Your tokens:"
Write-Host "=" * 70
Write-Host "`nREFRESH TOKEN (add this to .env):"
Write-Host "GOOGLE_REFRESH_TOKEN=$($response.refresh_token)"
Write-Host "`nAccess Token: $($response.access_token)"
Write-Host "Expires In: $($response.expires_in) seconds"
```

---

## 🔧 Method 3: Using Your Main Server

If your main server (port 3002) is already running:

### Step 1: Make Sure Server Has GMB Route

Your server.js should have:

```javascript
import googleMyBusinessRoutes from "./routes/googleMyBusiness.js";
app.use("/api/gmb", googleMyBusinessRoutes);
```

### Step 2: Open Auth URL

```
https://accounts.google.com/o/oauth2/auth?client_id=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com&redirect_uri=http://localhost:3002/api/gmb/callback&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent
```

### Step 3: Your Server Will Handle It

The callback route in your main server will:

1. Receive the authorization code
2. Exchange it for tokens
3. Return the refresh token

---

## 📋 Quick Copy-Paste Commands

### Add Redirect URI to Google Console:

Navigate to: https://console.cloud.google.com/apis/credentials

Add these URIs:

```
http://localhost:3005/callback
http://localhost:3002/api/gmb/callback
```

### Run Token Generator:

```bash
cd backend
node get-google-token.js
```

### Manual PowerShell Method (all in one):

```powershell
# Step 1: Open browser to this URL
Start-Process "https://accounts.google.com/o/oauth2/auth?client_id=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com&redirect_uri=http://localhost:3005/callback&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent"

# Step 2: After authentication, paste your code here
$code = Read-Host "Enter the authorization code from the URL"

# Step 3: Exchange for tokens
$body = @{
    code = $code
    client_id = "679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com"
    client_secret = "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"
    redirect_uri = "http://localhost:3005/callback"
    grant_type = "authorization_code"
}

$response = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

Write-Host "`n✅ SUCCESS!"
Write-Host "`nAdd this to your .env file:"
Write-Host "GOOGLE_REFRESH_TOKEN=$($response.refresh_token)"
```

---

## ✅ After Getting Your Token

1. Open `backend/.env`
2. Find line 59: `GOOGLE_REFRESH_TOKEN=your_refresh_token_here`
3. Replace with: `GOOGLE_REFRESH_TOKEN=1//0gABCDEF...`
4. Save the file
5. Test it:
   ```bash
   node examples/googleMyBusinessExample.js
   ```

---

## 🔍 Troubleshooting

### "redirect_uri_mismatch" Error

- Go to Google Cloud Console
- Add `http://localhost:3005/callback` to authorized redirect URIs
- Save and try again

### Port 3002 Already in Use

- The token generator now uses port 3005 (no conflict)
- Make sure port 3005 is not in use

### No Browser Opens

- Copy the URL from terminal
- Paste in your browser manually

### "Access Denied" Error

- Make sure you have a Google My Business account
- Logged into correct Google account
- Google My Business API is enabled

### No Refresh Token in Response

- Revoke access: https://myaccount.google.com/permissions
- Run script again
- Make sure URL has `prompt=consent`

---

## 📞 Need Help?

If all methods fail, you can:

1. Contact me with the error message
2. Check Google Cloud Console logs
3. Verify OAuth credentials are correct
4. Make sure Google My Business API is enabled

---

## ⚡ TL;DR - Fastest Method

```bash
# 1. Add redirect URI to Google Console (once)
#    https://console.cloud.google.com/apis/credentials
#    Add: http://localhost:3005/callback

# 2. Run token generator
cd backend
node get-google-token.js

# 3. Login in browser, grant permissions

# 4. Copy token from terminal to .env file

# Done! ✅
```
