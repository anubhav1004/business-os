# Business AI - Setup Guide

Complete guide to setting up and running the Business AI multi-agent platform.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Claude Code**: Installed and configured
- **Disk Space**: At least 1GB free
- **Anthropic API Key**: Get from [console.claude.com](https://console.claude.com)

## Step 1: Free Up Disk Space

**IMPORTANT**: You need at least 1GB of free disk space to install Next.js and dependencies.

Check your current disk space:
```bash
df -h .
```

If you're low on space, clean up:
```bash
# Clean npm cache
npm cache clean --force

# Clean system caches (macOS)
sudo rm -rf ~/Library/Caches/*

# Remove unused Docker images (if applicable)
docker system prune -a
```

## Step 2: Install Dependencies

Once you have sufficient disk space, install the required packages:

```bash
# Install Next.js and core dependencies
npm install next@latest react@latest react-dom@latest

# Install Agent SDK
npm install @anthropic-ai/claude-agent-sdk

# Install database
npm install better-sqlite3

# Install utilities
npm install zod recharts

# Install dev dependencies
npm install --save-dev \
  typescript \
  @types/react \
  @types/react-dom \
  @types/node \
  @types/better-sqlite3 \
  tailwindcss \
  postcss \
  autoprefixer \
  eslint \
  eslint-config-next

# Install Google Analytics (optional, for Growth agent)
npm install @google-analytics/data
```

## Step 3: Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Step 4: Update package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Step 5: Create Next.js App Structure

Create the required directories and files:

```bash
# Create Next.js app directory
mkdir -p app/api/chat
mkdir -p app/api/sessions
mkdir -p app/api/visualize

# Create components directories
mkdir -p components/chat
mkdir -p components/visualizations
mkdir -p components/ui

# Create lib directories (already exist)
# lib/agents, lib/db, lib/mcp, lib/types, lib/utils
```

## Step 6: Set Up Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Anthropic API Key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Mixpanel
MIXPANEL_PROJECT_ID=your-project-id
MIXPANEL_API_SECRET=your-api-secret

# Google Analytics 4
GA4_PROPERTY_ID=your-property-id
GA4_CREDENTIALS={"type":"service_account","project_id":"..."}

# App Store Connect
APP_STORE_KEY_ID=your-key-id
APP_STORE_ISSUER_ID=your-issuer-id
APP_STORE_PRIVATE_KEY=your-private-key

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_CLIENT_ID=your-client-id
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token

# Meta Ads
META_ADS_ACCESS_TOKEN=your-access-token
META_ADS_ACCOUNT_ID=your-account-id

# Database
DATABASE_ENCRYPTION_KEY=your-encryption-key-for-credentials
```

## Step 7: Initialize the Database

Create a script to initialize the database:

```bash
# Create init script
cat > scripts/init-db.ts << 'EOF'
import { getDB } from '../lib/db/client';

console.log('Initializing database...');
const db = getDB();
console.log('✅ Database initialized successfully!');
console.log('Database location:', db.name);
EOF

# Run it
npx tsx scripts/init-db.ts
```

## Step 8: Create Essential Files

### 1. Global Styles (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
```

### 2. Root Layout (`app/layout.tsx`)

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Business AI',
  description: 'Multi-agent business intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Home Page (`app/page.tsx`)

See the example in the codebase (to be created).

### 4. Chat API Route (`app/api/chat/route.ts`)

See the example in the codebase (to be created).

## Step 9: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 10: Test the System

1. **Test Database**: Verify the database is initialized
2. **Test Chat Interface**: Send a simple message
3. **Test Agents**: Try queries for each specialized agent
4. **Test MCP Integration**: Verify API connections work

Example test queries:
```
"What's our product performance this month?" → Product Agent
"Show me our ad ROI" → Marketing Agent
"Analyze organic traffic trends" → Growth Agent
"Research our top competitors" → Research Agent
```

## Troubleshooting

### Issue: "Cannot find module 'next'"

**Solution**: Install Next.js dependencies
```bash
npm install next@latest react@latest react-dom@latest
```

### Issue: "ENOSPC: no space left on device"

**Solution**: Free up disk space (see Step 1)

### Issue: "Anthropic API key not found"

**Solution**: Make sure `.env.local` exists with `ANTHROPIC_API_KEY`

### Issue: "Database file is locked"

**Solution**: Close any other processes using the database
```bash
lsof business-ai.db
# Kill processes if needed
```

### Issue: "MCP server failed to start"

**Solution**: Check that API credentials are correct in `.env.local`

## Project Structure

After setup, your project should look like:

```
business-ai/
├── app/
│   ├── api/
│   │   ├── chat/route.ts
│   │   ├── sessions/route.ts
│   │   └── visualize/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── chat/
│   ├── visualizations/
│   └── ui/
├── lib/
│   ├── agents/
│   ├── db/
│   ├── mcp/
│   ├── types/
│   └── utils/
├── public/
├── scripts/
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── business-ai.db
├── ARCHITECTURE.md
├── SETUP.md
└── README.md
```

## Next Steps

1. **Add Authentication**: Implement user login and team assignment
2. **Complete MCP Servers**: Implement remaining API integrations
3. **Build UI Components**: Create chat interface and visualizations
4. **Add More Agents**: Create additional specialized agents as needed
5. **Deploy**: Deploy to Vercel or your preferred platform

## Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Other Platforms

- **Railway**: Supports Next.js
- **Render**: Supports Next.js
- **AWS Amplify**: Full-stack deployment
- **DigitalOcean**: App Platform

## Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Claude Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [MCP Documentation](https://modelcontextprotocol.io/)

## Support

For issues and questions:
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [Claude Agent SDK docs](https://platform.claude.com/docs/en/agent-sdk/overview)
- Open an issue on GitHub
