# Environment Variables Setup

## Web App + Chrome Extension Configuration

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the project root with:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-openai-key-here

# API Base URL for Chrome Extension
API_BASE_URL=http://localhost:3002/api
```

### Step 2: Generate Extension Config

Run the following command to generate `chrome-extension/config.js` from `.env.local`:

```bash
npm run generate:extension-config
```

This will:

- Read `API_BASE_URL` from `.env.local`
- Auto-generate `chrome-extension/config.js`
- Extension will use the same API URL as web app

### Step 3: Restart Services

1. **Restart Web App:**

   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Reload Extension:**
   - Go to `chrome://extensions/`
   - Find "Meeting AI Assistant"
   - Click **Reload** (??)

---

## Development vs Production

### Development (localhost)

`.env.local`:

```bash
API_BASE_URL=http://localhost:3002/api
```

Then run:

```bash
npm run generate:extension-config
```

### Production (deployed)

`.env.local`:

```bash
API_BASE_URL=https://your-domain.com/api
```

Then run:

```bash
npm run generate:extension-config
```

---

## Single Source of Truth

? **`.env.local`** = Single config file for both Web App and Extension

? **Auto-generate** extension config from `.env.local`

? **No manual sync** between two config files

---

## Workflow

1. Update `API_BASE_URL` in `.env.local`
2. Run `npm run generate:extension-config`
3. Restart web app (Ctrl+C ? npm run dev)
4. Reload extension (chrome://extensions/)
5. Done! Both use same API URL
