#!/bin/bash
echo "🚀 Starting AWS App Runner Backend Service..."
echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

# Navigate to backend directory if not already there
if [ ! -f "server-apprunner.js" ]; then
    echo "📂 Navigating to backend directory..."
    cd backend
    echo "📁 New directory: $(pwd)"
    echo "📋 Backend directory contents:"
    ls -la
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Start the server
echo "🚀 Starting server-apprunner.js on port 3002..."
exec node server-apprunner.js