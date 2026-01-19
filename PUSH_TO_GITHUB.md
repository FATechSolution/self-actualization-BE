# 📤 How to Push Code to GitHub (Windows)

## ✅ Method 1: GitHub Desktop (EASIEST)

1. **Download GitHub Desktop** (if not installed):
   - Go to: https://desktop.github.com/
   - Download and install

2. **Open GitHub Desktop**
   - Sign in with your GitHub account

3. **Add your repository:**
   - File → Add Local Repository
   - Choose: `b:\Self-Actualization-Analysis-BE`

4. **Commit and Push:**
   - You'll see your changes in GitHub Desktop
   - Add commit message: "fix: Add optional authentication to needs endpoint"
   - Click "Commit to main"
   - Click "Push origin"

✅ **DONE!** Your code is now on GitHub

---

## ✅ Method 2: GitHub CLI (Terminal - Quick)

1. **Install GitHub CLI:**
   ```powershell
   winget install GitHub.cli
   ```
   (Or download from: https://cli.github.com/)

2. **Authenticate:**
   ```powershell
   gh auth login
   ```
   - Choose: GitHub.com
   - Choose: HTTPS
   - Choose: Login with a web browser
   - Copy the code shown
   - Press Enter (browser will open)
   - Paste the code and authorize

3. **Push your code:**
   ```powershell
   cd b:\Self-Actualization-Analysis-BE
   git push origin main
   ```

✅ **DONE!**

---

## ✅ Method 3: Personal Access Token (No Extra Software)

1. **Create a GitHub Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name: "Self-Actualization-Deploy"
   - Check: ✅ repo (full control)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Update Git to use token:**
   ```powershell
   cd b:\Self-Actualization-Analysis-BE
   
   # Remove old credential
   git config --global --unset credential.helper
   
   # Set new credential helper
   git config --global credential.helper wincred
   
   # Push (it will ask for username and password)
   git push origin main
   ```

3. **When prompted:**
   - Username: `your-github-username`
   - Password: `PASTE-YOUR-TOKEN-HERE` (not your GitHub password!)

✅ **DONE!**

---

## 🔄 After Pushing to GitHub

### Pull on AWS Server (one command):

SSH into AWS and run:
```bash
cd /path/to/backend && git pull origin main && pm2 restart all
```

Or ask your teammate/DevOps to do it!

---

## 🧪 Verify Deployment

After pulling on AWS, test:
```
http://3.26.225.122:5005/api/goals/needs/Survival
```

Should return:
```json
{
  "success": true,
  "category": "Survival",
  "total": 8,
  "data": [...]
}
```
