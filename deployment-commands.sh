#!/bin/bash

echo "🚀 AWS App Runner Deployment Commands"
echo "======================================"

echo ""
echo "1. 📝 Check your apprunner.yaml configuration:"
echo "   cat apprunner.yaml"

echo ""
echo "2. 🧹 Clean up before deployment:"
echo "   rm -rf backend/node_modules"
echo "   rm -f backend/package-lock.json"

echo ""
echo "3. 📦 Test build locally:"
echo "   npm install --prefix backend --production"

echo ""
echo "4. 🏃 Test server locally:"
echo "   cd backend && node server-apprunner.js"

echo ""
echo "5. ❤️ Test health endpoint:"
echo "   curl http://localhost:3002/health"

echo ""
echo "6. 📡 Test API endpoint:"
echo "   curl http://localhost:3002/api/status"

echo ""
echo "7. ☁️ Deploy to AWS App Runner:"
echo "   git add ."
echo "   git commit -m \"Fix App Runner configuration for Node.js deployment\""
echo "   git push origin main"

echo ""
echo "8. 🔍 After deployment, test the live endpoints:"
echo "   curl https://your-apprunner-url.ap-southeast-2.awsapprunner.com/health"
echo "   curl https://your-apprunner-url.ap-southeast-2.awsapprunner.com/api/status"

echo ""
echo "📋 Files created/updated for deployment:"
echo "   ✅ apprunner.yaml - Fixed configuration"
echo "   ✅ .apprunner-ignore - Exclude unnecessary files"
echo "   ✅ backend/package.json - Added ES module support"
echo "   ✅ backend/health-check.js - Deployment verification"

echo ""
echo "🔧 Key fixes applied:"
echo "   • Fixed apprunner.yaml to use server-apprunner.js"
echo "   • Added proper health check path (/health)"
echo "   • Added ES module support in backend package.json"
echo "   • Created .apprunner-ignore to reduce deployment size"
echo "   • Set production environment variables"