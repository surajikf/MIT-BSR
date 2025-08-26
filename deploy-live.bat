@echo off
echo 🚀 Building Trading Signals Pro for Live Deployment...

REM Navigate to client directory
cd client

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the production app
echo 🔨 Building production app...
npm run build

echo ✅ Build complete!
echo 📁 Build files created in: client/build/
echo.
echo 🌐 To deploy to GitHub Pages:
echo 1. Push to live branch: git push origin live
echo 2. GitHub Actions will automatically deploy to:
echo    https://surajikf.github.io/MIT-BSR
echo.
echo 📱 Your app will be live at:
echo    https://surajikf.github.io/MIT-BSR
pause
