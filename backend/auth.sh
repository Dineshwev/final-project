#!/bin/bash

# Google OAuth 2.0 Authorization Script
# This script helps you get a refresh token for Google My Business API

# Color codes for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# OAuth Configuration
CLIENT_ID="679671394769-8ujh33v8sif1i1n19vuccd0pmt9q2ti8.apps.googleusercontent.com"
CLIENT_SECRET="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"
REDIRECT_URI="http://localhost:3002/api/gmb/callback"
SCOPE="https://www.googleapis.com/auth/business.manage"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Google OAuth 2.0 Token Generator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Generate and display the authorization URL
AUTH_URL="https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&access_type=offline&prompt=consent"

echo -e "${GREEN}STEP 1: Authorize the application${NC}"
echo -e "${YELLOW}Please visit this URL in your browser:${NC}"
echo ""
echo -e "${BLUE}${AUTH_URL}${NC}"
echo ""
echo -e "${YELLOW}Instructions:${NC}"
echo "  1. Click the link above (or copy and paste it into your browser)"
echo "  2. Sign in with your Google account"
echo "  3. Grant the requested permissions"
echo "  4. You will be redirected to: ${REDIRECT_URI}?code=..."
echo "  5. Copy the 'code' parameter from the URL"
echo ""

# Step 2: Get the authorization code from user
echo -e "${GREEN}STEP 2: Enter the authorization code${NC}"
echo -e "${YELLOW}Paste the authorization code here:${NC}"
read -r AUTH_CODE

# Validate input
if [ -z "$AUTH_CODE" ]; then
    echo -e "${RED}Error: No authorization code provided${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}STEP 3: Exchanging authorization code for tokens...${NC}"
echo ""

# Step 3: Exchange authorization code for tokens
TOKEN_RESPONSE=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "redirect_uri=${REDIRECT_URI}" \
  -d "grant_type=authorization_code" \
  -d "code=${AUTH_CODE}")

# Check if curl was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to make request to token endpoint${NC}"
    exit 1
fi

# Step 4: Display the response
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  TOKEN RESPONSE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Full JSON Response:${NC}"
echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"
echo ""

# Extract tokens using grep and sed (works without jq)
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"access_token"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"refresh_token"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"refresh_token"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
EXPIRES_IN=$(echo "$TOKEN_RESPONSE" | grep -o '"expires_in"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/"expires_in"[[:space:]]*:[[:space:]]*\([0-9]*\)/\1/')

# Display extracted values
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  EXTRACTED TOKENS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}Access Token:${NC}"
    echo "$ACCESS_TOKEN"
    echo ""
fi

if [ -n "$REFRESH_TOKEN" ]; then
    echo -e "${YELLOW}Refresh Token:${NC}"
    echo "$REFRESH_TOKEN"
    echo ""
    
    echo -e "${GREEN}✓ Success! Refresh token obtained.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Copy the refresh token above"
    echo "  2. Add it to your .env file:"
    echo -e "     ${BLUE}GOOGLE_REFRESH_TOKEN=${REFRESH_TOKEN}${NC}"
    echo ""
else
    echo -e "${RED}✗ Error: Could not extract refresh token${NC}"
    echo ""
    echo -e "${YELLOW}Possible issues:${NC}"
    echo "  - Invalid authorization code"
    echo "  - Authorization code already used"
    echo "  - Incorrect OAuth configuration"
    echo ""
    echo -e "${YELLOW}Please check the full JSON response above for error details.${NC}"
    exit 1
fi

if [ -n "$EXPIRES_IN" ]; then
    echo -e "${YELLOW}Token expires in:${NC} $EXPIRES_IN seconds ($(($EXPIRES_IN / 60)) minutes)"
    echo ""
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Script completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
