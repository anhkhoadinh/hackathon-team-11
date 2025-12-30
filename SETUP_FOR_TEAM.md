# ?? Setup Guide for Team Members

## Quick Start (5 minutes)

### Step 1: Clone & Install

```bash
cd meeting-ai
npm install
```

### Step 2: Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values
```

**Edit `.env.local`:**

```env
# Your OpenAI API key
OPENAI_API_KEY=sk-your-key-here

# ??  IMPORTANT: Only change the PORT here if needed!
# Default is 3002, but you can use 3000, 3001, 8080, etc.
API_BASE_URL=http://localhost:3002/api

# Your Supabase database URLs
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Step 3: Generate Extension Config

```bash
# This command will automatically update:
# - chrome-extension/config.js
# - chrome-extension/manifest.json
npm run generate:extension-config
```

**You should see:**

```
?? Parsed configuration:
   - API_BASE_URL: http://localhost:3002/api
   - Base URL: http://localhost:3002
   - Host: localhost
   - Port: 3002

? Updated: chrome-extension/config.js
? Updated: chrome-extension/manifest.json
   - host_permissions: localhost:3002
   - content_scripts matches: localhost:3002/results*, localhost:3002/history*
```

### Step 4: Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 5: Start Development Server

```bash
npm run dev
```

**Server will start on the port you specified in `API_BASE_URL`!**

### Step 6: Load Chrome Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select: `meeting-ai/chrome-extension` folder
5. Done! ??

---

## ?? Using a Different Port

**If port 3002 is already in use, or you prefer a different port:**

### 1. Edit `.env.local` ONLY

```env
# Change ONLY this line:
API_BASE_URL=http://localhost:3000/api
# or
API_BASE_URL=http://localhost:8080/api
# or any port you want!
```

### 2. Regenerate Config

```bash
npm run generate:extension-config
```

### 3. Reload Everything

```bash
# Restart Next.js server
npm run dev

# In Chrome: chrome://extensions/
# Click reload icon (?) on Meeting AI extension

# Close all Google Meet tabs
# Open new Meet tab to test
```

**That's it! No need to manually edit multiple files! ??**

---

## ?? What Gets Auto-Updated?

When you run `npm run generate:extension-config`, it automatically updates:

| File | What Changes |
|------|--------------|
| `chrome-extension/config.js` | API_BASE_URL |
| `chrome-extension/manifest.json` | host_permissions, content_scripts matches |

**You DON'T need to manually edit these files!**

---

## ?? Common Issues

### Issue 1: Extension not loading

**Solution:** Make sure you ran `npm run generate:extension-config` after changing `.env.local`

### Issue 2: CORS errors

**Solution:** Check that your `API_BASE_URL` matches the server port

```bash
# In terminal running `npm run dev`, you should see:
# - Local: http://localhost:3002

# Your .env.local should have:
API_BASE_URL=http://localhost:3002/api
```

### Issue 3: "Failed to fetch"

**Solution:**

1. Server running? (`npm run dev`)
2. Extension reloaded? (chrome://extensions/ ? ?)
3. Meet tabs closed? (close all Google Meet tabs)

### Issue 4: Port already in use

```
Error: listen EADDRINUSE: address already in use :::3002
```

**Solution:** Change port in `.env.local` and regenerate:

```bash
# Edit .env.local:
API_BASE_URL=http://localhost:3001/api

# Regenerate config:
npm run generate:extension-config

# Restart server:
npm run dev
```

---

## ?? Advanced: Manual Port Change (NOT Recommended)

**??  You should use `npm run generate:extension-config` instead!**

But if you need to know what gets updated:

1. `.env.local` - API_BASE_URL
2. `chrome-extension/config.js` - API_BASE_URL
3. `chrome-extension/manifest.json`:
   - `host_permissions`
   - `content_scripts[1].matches`

---

## ?? Checklist for New Team Members

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in API keys in `.env.local`
- [ ] Run `npm run generate:extension-config`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Run `npm run dev`
- [ ] Load Chrome Extension
- [ ] Test recording in Google Meet

---

## ?? Summary

**Remember:**

- ? **Change port ONLY in `.env.local`**
- ? **Run `npm run generate:extension-config` after changes**
- ? **Reload extension and restart server**
- ? **DON'T manually edit `config.js` or `manifest.json`**

**One command to rule them all:**

```bash
npm run generate:extension-config
```

---

## ?? Need Help?

- Check documentation: `README.md`, `QUICKSTART.md`
- Database setup: `DATABASE_SETUP.md`
- Environment setup: `ENV_SETUP.md`

---

**Happy coding! ??**
