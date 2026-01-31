#!/bin/bash

# Business AI - Start Development Server
# This script starts the Next.js development server

set -e

echo "🚀 Starting Business AI Development Server..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed!"
    echo "Please run: ./scripts/install.sh"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "The app will run but won't connect to Claude API"
    echo ""
fi

# Check if database exists
if [ ! -f "business-ai.db" ]; then
    echo "⚠️  Warning: Database not found, initializing..."
    npx tsx -e "import { getDB } from './lib/db/client.js'; getDB();"
    echo "✅ Database created"
    echo ""
fi

echo "Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

# Start the development server
npm run dev
