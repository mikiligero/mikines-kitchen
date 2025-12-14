#!/bin/bash

echo "⬇️  Pulling latest changes..."
git pull

echo "♻️  Rebuilding and restarting container..."
docker compose up -d --build

echo "🧹  Cleaning up unused images..."
docker image prune -f

echo "✅  Update complete!"
