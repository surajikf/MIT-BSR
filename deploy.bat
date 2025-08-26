@echo off
echo 🚀 Deploying Trading Signals Pro...

REM Add all changes
git add -A

REM Commit with timestamp
git commit -m "Update: %date% %time% - Trading Signals Pro"

REM Push to live branch
git push origin live

REM Push to main branch
git push origin main

echo ✅ Deployment complete!
echo 🌐 Live branch: https://github.com/surajikf/MIT-BSR/tree/live
echo 📱 Main branch: https://github.com/surajikf/MIT-BSR/tree/main
pause
