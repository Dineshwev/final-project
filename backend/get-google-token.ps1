# Google OAuth2 Token Generator - PowerShell Script
# This script helps you get Google refresh token

Write-Host "`n🔐 Google OAuth2 Token Generator" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

# Your credentials
$clientId = "679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com"
$clientSecret = "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"
$redirectUri = "http://localhost:3005/callback"

# Build authorization URL
$authUrl = "https://accounts.google.com/o/oauth2/auth?client_id=$clientId&redirect_uri=$redirectUri&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent"

Write-Host "`n📝 Step 1: Opening browser for authentication..." -ForegroundColor Yellow
Write-Host "`nIf browser doesn't open, copy this URL:" -ForegroundColor Gray
Write-Host $authUrl -ForegroundColor White

# Open browser
Start-Process $authUrl

Write-Host "`n⏳ Waiting for you to authenticate in browser..." -ForegroundColor Yellow
Write-Host "`nAfter authentication, you'll be redirected to a URL like:" -ForegroundColor Gray
Write-Host "http://localhost:3005/callback?code=4/0AVG7fiQ9X..." -ForegroundColor White

# Get authorization code from user
Write-Host "`n📋 Step 2: Copy the FULL redirect URL from your browser" -ForegroundColor Yellow
$redirectUrl = Read-Host "`nPaste the full redirect URL here"

# Extract code from URL
if ($redirectUrl -match 'code=([^&]+)') {
    $authCode = $matches[1]
    Write-Host "`n✅ Authorization code extracted: $($authCode.Substring(0, 20))..." -ForegroundColor Green
} else {
    Write-Host "`n❌ Error: Could not find authorization code in URL" -ForegroundColor Red
    Write-Host "Make sure you copied the complete URL" -ForegroundColor Yellow
    exit 1
}

# Exchange code for tokens
Write-Host "`n🔄 Step 3: Exchanging code for tokens..." -ForegroundColor Yellow

try {
    $body = @{
        code          = $authCode
        client_id     = $clientId
        client_secret = $clientSecret
        redirect_uri  = $redirectUri
        grant_type    = "authorization_code"
    }

    $response = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body

    # Success!
    Write-Host "`n" -NoNewline
    Write-Host ("=" * 70) -ForegroundColor Green
    Write-Host "✅ SUCCESS! Your tokens:" -ForegroundColor Green
    Write-Host ("=" * 70) -ForegroundColor Green

    Write-Host "`n📝 REFRESH TOKEN (add this to your .env file):" -ForegroundColor Yellow
    Write-Host "`nGOOGLE_REFRESH_TOKEN=$($response.refresh_token)" -ForegroundColor Cyan

    Write-Host "`n`nOther tokens (for reference):" -ForegroundColor Gray
    Write-Host "Access Token: $($response.access_token.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "Token Type: $($response.token_type)" -ForegroundColor Gray
    Write-Host "Expires In: $($response.expires_in) seconds" -ForegroundColor Gray

    Write-Host "`n" -NoNewline
    Write-Host ("=" * 70) -ForegroundColor Green

    # Instructions
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the GOOGLE_REFRESH_TOKEN line above" -ForegroundColor White
    Write-Host "2. Open backend\.env file" -ForegroundColor White
    Write-Host "3. Replace line 59 with the copied line" -ForegroundColor White
    Write-Host "4. Save the file" -ForegroundColor White
    Write-Host "5. Restart your server" -ForegroundColor White

    # Copy to clipboard
    try {
        "GOOGLE_REFRESH_TOKEN=$($response.refresh_token)" | Set-Clipboard
        Write-Host "`n✅ Token copied to clipboard!" -ForegroundColor Green
    } catch {
        Write-Host "`n⚠️  Note: Could not copy to clipboard automatically" -ForegroundColor Yellow
    }

} catch {
    Write-Host "`n❌ Error exchanging code for tokens:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Message -match "invalid_grant") {
        Write-Host "`n💡 This usually means:" -ForegroundColor Yellow
        Write-Host "   - The authorization code was already used" -ForegroundColor White
        Write-Host "   - The code expired (10 minutes timeout)" -ForegroundColor White
        Write-Host "   - The redirect URI doesn't match" -ForegroundColor White
        Write-Host "`n   Please run the script again from the start" -ForegroundColor White
    }
    
    exit 1
}

Write-Host "`n✅ Done! Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
