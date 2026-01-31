# Installation Guide - Business AI Web Application

## Quick Start

Follow these steps to get your Business AI web application up and running.

### Step 1: Install Dependencies

Run this command in your terminal:

```bash
npm install
```

This will install:
- **Next.js**: Web framework
- **React**: UI library
- **Agent SDK**: AI agents
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Better SQLite3**: Database
- **Recharts**: Data visualization
- **Zod**: Type validation

**Expected install time**: 2-5 minutes
**Required disk space**: ~500MB

### Step 2: Set Up Environment Variables

Create your environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```env
# Required
ANTHROPIC_API_KEY=your-api-key-from-console.claude.com

# Optional - Add these when ready to connect real data sources
MIXPANEL_PROJECT_ID=your-project-id
MIXPANEL_API_SECRET=your-api-secret
GA4_PROPERTY_ID=your-property-id
GA4_CREDENTIALS={"type":"service_account",...}
```

Get your Anthropic API key from: https://console.claude.com/

### Step 3: Initialize the Database

Create and initialize the SQLite database:

```bash
npx tsx -e "import { getDB } from './lib/db/client'; console.log('Initializing database...'); getDB(); console.log('✅ Database ready!');"
```

This creates `business-ai.db` with the required tables.

### Step 4: Start the Development Server

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

You should see the Business AI chat interface! 🎉

## Mobile Testing

### Test on Your Phone

1. Find your computer's local IP address:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet "

   # On Windows
   ipconfig
   ```

2. Make sure your phone is on the same WiFi network

3. Open your phone's browser and go to:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```

   Example: `http://192.168.1.100:3000`

### Chrome DevTools Mobile Emulation

1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (or Ctrl+Shift+M)
3. Select a mobile device from the dropdown
4. Test touch interactions and responsiveness

### Recommended Test Devices

- **iPhone SE**: Small screen (375px)
- **iPhone 14 Pro**: Modern iPhone (393px)
- **iPad**: Tablet view (768px)
- **Pixel 7**: Android phone (412px)

## Mobile-Optimized Features

### ✅ Responsive Design
- Mobile-first approach
- Adapts from 320px to 4K displays
- Touch-optimized button sizes (44px minimum)

### ✅ Performance
- Server-side rendering for fast initial load
- Streaming responses for real-time updates
- Optimized for 3G/4G networks

### ✅ User Experience
- Smooth scrolling and animations
- Keyboard avoids input overlap (iOS)
- Safe area support for notch/home indicator
- Pull-to-refresh friendly
- Dark mode support

### ✅ PWA Features (Progressive Web App)
- Add to home screen
- Offline-ready (with service worker)
- App-like experience
- Fast and reliable

## Troubleshooting

### "npm install" fails with ENOSPC

**Problem**: Not enough disk space

**Solution**:
```bash
# Free up space
npm cache clean --force

# Check available space
df -h .

# You need at least 500MB free
```

### Port 3000 already in use

**Problem**: Another app is using port 3000

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001

# Or find and kill the process using port 3000
lsof -ti:3000 | xargs kill
```

### "Module not found" errors

**Problem**: Dependencies not installed correctly

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Database initialization fails

**Problem**: Permission issues or corrupted database

**Solution**:
```bash
# Remove existing database and recreate
rm business-ai.db
npx tsx -e "import { getDB } from './lib/db/client'; getDB();"
```

### Mobile: Text too small / UI doesn't fit

**Problem**: Viewport not configured correctly

**Solution**: Make sure `app/layout.tsx` includes the viewport configuration. It's already set up in the code.

### Mobile: Can't scroll on iOS

**Problem**: Touch scrolling not enabled

**Solution**: The CSS includes `-webkit-overflow-scrolling: touch` - this is already configured.

## Next Steps

### 1. Connect Real Data Sources

When you're ready, add MCP servers in `app/api/chat/route.ts`:

```typescript
// Uncomment these lines
const mcpServers = {
  mixpanel: createMixpanelMCP({
    projectId: process.env.MIXPANEL_PROJECT_ID!,
    apiSecret: process.env.MIXPANEL_API_SECRET!,
  }),
  // ... other MCP servers
};
```

### 2. Add Authentication

Replace the mock user in `app/page.tsx` with real authentication:
- NextAuth.js
- Clerk
- Auth0
- Or your own solution

### 3. Deploy to Production

Deploy to Vercel (recommended):

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

Alternative platforms:
- Railway
- Render
- Netlify
- AWS Amplify

### 4. Add Data Visualization

Create chart components in `components/visualizations/` using Recharts to display analytics data.

### 5. Implement More Agents

Add specialized agents for:
- Finance/Revenue analytics
- Customer support metrics
- Sales pipeline analysis
- Team productivity

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
npm run agent "Your question here"
```

## Project Structure

```
business-ai/
├── app/
│   ├── api/chat/          # Chat API endpoint ✅
│   ├── api/sessions/      # Session management ✅
│   ├── layout.tsx         # Root layout ✅
│   ├── page.tsx           # Home page ✅
│   └── globals.css        # Global styles ✅
├── components/chat/       # Chat UI components ✅
├── lib/
│   ├── agents/           # AI agents ✅
│   ├── db/               # Database ✅
│   ├── mcp/              # API integrations ✅
│   └── types/            # TypeScript types ✅
├── public/               # Static files ✅
└── package.json          # Dependencies ✅
```

✅ = Ready to use

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)

## Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [SETUP.md](./SETUP.md) for detailed setup
- Read [STATUS.md](./STATUS.md) for project status

---

**Ready to go!** Run `npm install && npm run dev` to start building. 🚀
