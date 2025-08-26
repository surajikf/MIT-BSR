#!/bin/bash

# Quick deployment script for Trading Signals Pro
echo "🚀 Deploying Trading Signals Pro..."

# Add all changes
git add -A

# Commit with timestamp
git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S') - Trading Signals Pro"

# Push to live branch
git push origin live

# Push to main branch
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Live branch: https://github.com/surajikf/MIT-BSR/tree/live"
echo "📱 Main branch: https://github.com/surajikf/MIT-BSR/tree/main"
