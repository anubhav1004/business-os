# Quick Start Guide

Get your Business AI platform running in 3 steps!

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
cd /Users/anubhavmishra/business-ai
npm install
```

**What this does:**
- Installs Next.js, React, and all required packages
- Takes 2-5 minutes
- Requires ~500MB disk space

**Expected output:**
```
added 300+ packages in 2m
```

## Step 2: Set Up Environment

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```bash
# Open in your text editor
nano .env.local

# Or use VS Code
code .env.local
```

Add your key:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your API key from: https://console.claude.com/

## Step 3: Start the Server

Initialize the database and start:

```bash
# Initialize database (one-time setup)
npx tsx -e "import { getDB } from './lib/db/client.js'; getDB();"

# Start the development server
npm run dev
```

**Expected output:**
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

## Open the App

### On Desktop
Open your browser to: **http://localhost:3000**

### On Mobile (same WiFi network)

1. Find your computer's IP address:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # On Windows
   ipconfig
   ```

2. On your phone's browser, go to:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```

   Example: `http://192.168.1.100:3000`

## Using Helper Scripts

For easier management, use the provided scripts:

### Installation Script

```bash
# Make executable
chmod +x scripts/install.sh

# Run installation
./scripts/install.sh
```

This script:
- ✅ Installs all dependencies
- ✅ Initializes the database
- ✅ Creates .env.local from template
- ✅ Provides next steps

### Start Script

```bash
# Make executable
chmod +x scripts/start.sh

# Start the server
./scripts/start.sh
```

This script:
- ✅ Checks dependencies are installed
- ✅ Verifies database exists
- ✅ Starts the development server

## Verify It's Working

You should see:

1. **Welcome Screen** with:
   - "Welcome to Business AI" heading
   - 4 example prompt cards
   - Chat input at the bottom

2. **Try an Example**:
   - Click any example prompt card
   - See the message appear
   - Watch the typing indicator
   - Get a response from the agent

## Troubleshooting

### "npm install" fails

**Error**: `ENOSPC: no space left on device`

**Solution**:
```bash
# Free up space
npm cache clean --force
df -h .  # Check available space
```

### "Port 3000 already in use"

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001

# Or kill the process
lsof -ti:3000 | xargs kill
```

### "Cannot find module"

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Agent not responding

**Check**:
1. Is `ANTHROPIC_API_KEY` set in `.env.local`?
2. Is the key valid? (test at console.claude.com)
3. Check browser console for errors (F12)

### Database errors

**Solution**:
```bash
# Remove and recreate database
rm business-ai.db
npx tsx -e "import { getDB } from './lib/db/client.js'; getDB();"
```

## Next Steps

### 1. Test the Chat Interface

Try these example queries:
- "What's our 7-day retention rate?"
- "Show me our ROAS across all platforms"
- "Analyze organic traffic trends"
- "Research our top competitors"

### 2. Test Mobile Responsiveness

- Open on your phone
- Try the touch interactions
- Test in landscape mode
- Add to home screen (PWA)

### 3. Connect Real Data

Add API credentials to `.env.local`:
```env
MIXPANEL_PROJECT_ID=your-project-id
MIXPANEL_API_SECRET=your-api-secret
GA4_PROPERTY_ID=your-property-id
```

Then uncomment the MCP server code in `app/api/chat/route.ts`

### 4. Deploy to Production

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts to set up project
```

## Directory Structure

```
business-ai/
├── app/                    # Next.js app (ready ✅)
├── components/             # UI components (ready ✅)
├── lib/                    # Core libraries (ready ✅)
├── scripts/                # Helper scripts (ready ✅)
│   ├── install.sh         # Installation
│   └── start.sh           # Start server
├── .env.local             # Your API keys (create this)
├── package.json           # Dependencies
└── business-ai.db         # Database (auto-created)
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run standalone CLI agent
npm run agent "Your question"
```

## Support

Need help?
- 📖 Check [INSTALL.md](./INSTALL.md) for detailed setup
- 🏗️ Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- 📊 See [STATUS.md](./STATUS.md) for project status
- 🔧 Read [SETUP.md](./SETUP.md) for advanced configuration

## Summary

```bash
# Quick 3-command setup:
npm install
cp .env.example .env.local  # Then add your API key
npm run dev                 # Open http://localhost:3000
```

That's it! You're ready to use Business AI! 🎉

---

**Pro Tip**: Bookmark `http://localhost:3000` and add the PWA to your phone's home screen for quick access.
