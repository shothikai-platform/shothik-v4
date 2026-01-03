#!/bin/bash
set -e

echo "🚀 SHOTHIK MASTER SETUP 🚀"
echo "============================="

# 1. Cleanup Port 8080 (Backend)
echo "🧹 Checking Port 8080..."
lsof -ti :8080 | xargs kill -9 2>/dev/null || true
docker rm -f nlp-dev 2>/dev/null || true
echo "✅ Port 8080 cleared."

# 2. Try Pulling Cloud Production Image
echo "☁️  Attempting to pull Cloud Image (habiib91/nlp-inference-service:latest)..."
if docker pull habiib91/nlp-inference-service:latest; then
    echo "✅ Cloud Image Found! Starting Production Service..."
    docker run -d --name nlp-service -p 8080:8080 habiib91/nlp-inference-service:latest
    echo "🎉 NLP Backend is LIVE (Production Mode)."
else
    echo "⚠️  Cloud Image not ready yet."
    echo "🔄 Falling back to Local Dev Setup (Downloads models locally)..."
    
    # Run the setup script we created earlier
    ./backend-services/nlp-inference-service/setup-docker-files.sh
fi

echo ""
echo "============================="
echo "3. Application Status"
echo "   - NLP Backend: http://localhost:8080"
echo "   - Frontend:    http://localhost:3000 (Make sure to restart 'npm run dev'!)"
echo "============================="
