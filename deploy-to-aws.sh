#!/bin/bash

# AWS Deployment Script for Self-Actualization Backend
# This script deploys the fixes to AWS EC2

echo "🚀 Starting deployment to AWS..."
echo "================================"

# Step 1: Commit changes
echo ""
echo "📝 Step 1: Committing changes..."
git add src/routes/goalRoutes.js
git commit -m "fix: Add optional authentication to /api/goals/needs/:category endpoint"

if [ $? -ne 0 ]; then
  echo "⚠️  No changes to commit or commit failed"
fi

# Step 2: Push to GitHub
echo ""
echo "📤 Step 2: Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
  echo "❌ Failed to push to GitHub"
  exit 1
fi

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "================================"
echo "🔧 Next steps on AWS EC2:"
echo "================================"
echo ""
echo "SSH into your AWS server and run:"
echo ""
echo "  cd /path/to/self-actualization-backend"
echo "  git pull origin main"
echo "  pm2 restart all"
echo ""
echo "Or if using npm/node directly:"
echo "  cd /path/to/self-actualization-backend"
echo "  git pull origin main"
echo "  npm restart"
echo ""
echo "================================"
echo "🧪 After deployment, test with:"
echo "  curl http://3.26.225.122:5005/api/goals/needs/Survival"
echo "================================"
