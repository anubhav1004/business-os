#!/bin/bash

# Business AI - Installation Script
# This script installs all dependencies and sets up the project

set -e  # Exit on error

echo "🚀 Business AI - Installation Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    echo "Please check your disk space and try again"
    exit 1
fi

echo ""
echo -e "${BLUE}🗄️  Step 2: Initializing database...${NC}"
echo ""

# Initialize the database
npx tsx -e "
import { getDB } from './lib/db/client.js';
console.log('Creating database...');
const db = getDB();
console.log('✅ Database initialized successfully!');
console.log('Database location:', db.name);
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database ready!${NC}"
else
    echo -e "${YELLOW}⚠️  Database initialization had issues (this is okay if db already exists)${NC}"
fi

echo ""
echo -e "${BLUE}📝 Step 3: Setting up environment...${NC}"
echo ""

if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.local and add your ANTHROPIC_API_KEY${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found, skipping${NC}"
    fi
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Installation complete!${NC}"
echo ""
echo "Next steps:"
echo -e "${BLUE}1.${NC} Edit .env.local and add your ANTHROPIC_API_KEY"
echo -e "${BLUE}2.${NC} Run: ${GREEN}npm run dev${NC}"
echo -e "${BLUE}3.${NC} Open: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "For mobile testing, use: http://YOUR-IP:3000"
echo ""
