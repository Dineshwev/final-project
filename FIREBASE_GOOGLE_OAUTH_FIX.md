# 🔥 Firebase Google OAuth Setup Guide

## ❌ Current Problem

**Error:** `OAuth2 redirect uri is: https://health-4c77c.firebaseapp.com/__/auth/handler, response: OAuth2TokenResponse{params: error=invalid_client`

**Root Cause:** You're using OAuth credentials meant for Google My Business API, but Firebase Authentication needs its own OAuth client with different redirect URIs.

---

## ✅ Solution: Create OAuth Client for Firebase

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/apis/credentials
2. Make sure you're in the correct project (`health-4c77c`)

### Step 2: Create New OAuth 2.0 Client ID

Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

**Application type:** Web application

**Name:** `Firebase Authentication (health-4c77c)`

**Authorized redirect URIs:** Add these:

```
https://health-4c77c.firebaseapp.com/__/auth/handler
http://localhost
http://localhost:5173
http://localhost:3002
```

Click **"CREATE"**

### Step 3: Copy Credentials

You'll get:

- **Client ID:** `679671394769-XXXXXXXXXX.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-XXXXXXXXXX`

### Step 4: Configure in Firebase Console

1. Go to: https://console.firebase.google.com/project/health-4c77c/authentication/providers
2. Click **"Google"** provider
3. Click **"Edit"** (pencil icon)
4. **Web SDK configuration:**
   - Paste your **new Client ID**
   - Paste your **new Client Secret**
5. Click **"Save"**

### Step 5: Update Your .env File

Add these new credentials for Firebase:

```env
# Firebase Google OAuth (for Firebase Authentication)
FIREBASE_GOOGLE_CLIENT_ID=679671394769-XXXXXXXXXX.apps.googleusercontent.com
FIREBASE_GOOGLE_CLIENT_SECRET=GOCSPX-XXXXXXXXXX

# Google My Business API OAuth (keep separate)
GOOGLE_CLIENT_ID=679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

---

## 🎯 Quick Fix (Alternative)

If you want to use your **existing OAuth client** for Firebase:

### Step 1: Edit Existing OAuth Client

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth client: `679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8`
3. Under **"Authorized redirect URIs"**, add:
   ```
   https://health-4c77c.firebaseapp.com/__/auth/handler
   ```
4. Click **"SAVE"**

### Step 2: Configure in Firebase

1. Go to Firebase Console: https://console.firebase.google.com/project/health-4c77c/authentication/providers
2. Click "Google" provider
3. Enable it if not already enabled
4. Add your credentials:
   - **Web SDK configuration:**
     - Client ID: `679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com`
     - Client Secret: `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`
5. Save

---

## 📋 Verification Checklist

After setup, verify:

- [ ] OAuth client has Firebase redirect URI
- [ ] Firebase Console shows Google provider enabled
- [ ] Client ID and Secret match in Firebase
- [ ] Test login works

---

## 🧪 Test Firebase Google Login

### From Frontend:

```javascript
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();

try {
  const result = await signInWithPopup(auth, provider);
  console.log("✅ Login successful!", result.user);
} catch (error) {
  console.error("❌ Login failed:", error.code, error.message);
}
```

### From Your App:

1. Open your frontend: http://localhost:5173
2. Click "Login with Google"
3. Should work without errors

---

## 🔒 Security Notes

### Best Practice: Use Separate OAuth Clients

**Recommended Structure:**

```
OAuth Client 1: Firebase Authentication
├── Redirect URIs:
│   ├── https://health-4c77c.firebaseapp.com/__/auth/handler
│   ├── http://localhost
│   └── http://localhost:5173
└── Used for: User authentication in your app

OAuth Client 2: Google My Business API
├── Redirect URIs:
│   ├── http://localhost:3002/api/gmb/callback
│   └── http://localhost:3005/auth/callback
└── Used for: Backend API calls to Google My Business
```

This separation:

- ✅ Better security (principle of least privilege)
- ✅ Easier to manage permissions
- ✅ Clearer audit trails
- ✅ Independent rotation of credentials

---

## 🐛 Common Errors & Solutions

### Error: "unauthorized_client"

**Cause:** Redirect URI not authorized
**Fix:** Add `https://health-4c77c.firebaseapp.com/__/auth/handler` to OAuth client

### Error: "invalid_client"

**Cause:** Wrong Client ID or Secret
**Fix:** Double-check credentials match in Firebase Console

### Error: "redirect_uri_mismatch"

**Cause:** Redirect URI doesn't match exactly
**Fix:** URIs must match exactly (no trailing slashes, correct protocol)

### Error: "access_denied"

**Cause:** User didn't grant permissions
**Fix:** User needs to click "Allow" on consent screen

---

## 📞 Need Help?

If still having issues:

1. Check Google Cloud Console audit logs
2. Check Firebase Console logs
3. Clear browser cache and cookies
4. Try incognito mode
5. Verify project is active in Google Cloud

---

## ✅ Summary

**Problem:** Using wrong OAuth credentials with Firebase
**Solution:** Either create new OAuth client for Firebase OR add Firebase redirect URI to existing client
**Result:** Google login will work in your app

Follow the steps above and your Firebase Google authentication will work! 🎉
