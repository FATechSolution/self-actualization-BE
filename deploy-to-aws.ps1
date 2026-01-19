# AWS Deployment Script for Self-Actualization Backend (PowerShell)
# This script deploys the fixes to AWS EC2

Write-Host "🚀 Starting deployment to AWS..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Commit changes
Write-Host ""
Write-Host "📝 Step 1: Committing changes..." -ForegroundColor Yellow
git add src/routes/goalRoutes.js
git commit -m "fix: Add optional authentication to /api/goals/needs/:category endpoint"

# Step 2: Push to GitHub  
Write-Host ""
Write-Host "📤 Step 2: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔧 Next steps on AWS EC2:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SSH into your AWS server and run:" -ForegroundColor White
Write-Host ""
Write-Host "  cd /path/to/self-actualization-backend" -ForegroundColor Gray
Write-Host "  git pull origin main" -ForegroundColor Gray
Write-Host "  pm2 restart all" -ForegroundColor Gray
Write-Host ""
Write-Host "Or if using npm/node directly:" -ForegroundColor White
Write-Host "  cd /path/to/self-actualization-backend" -ForegroundColor Gray
Write-Host "  git pull origin main" -ForegroundColor Gray  
Write-Host "  npm restart" -ForegroundColor Gray
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🧪 After deployment, test with:" -ForegroundColor Cyan
Write-Host "  curl http://3.26.225.122:5005/api/goals/needs/Survival" -ForegroundColor Gray
Write-Host "================================" -ForegroundColor Cyan
