# Extension Configuration

## API URL Configuration

The extension needs to know where your API server is running.

### For Development (localhost)

1. Open `config.js`
2. Set `API_BASE_URL` to your local server:

   ```javascript
   API_BASE_URL: "http://localhost:3002/api"
   ```

### For Production (deployed)

1. Open `config.js`
2. Update `API_BASE_URL` to your deployed server:

   ```javascript
   API_BASE_URL: "https://your-domain.com/api"
   ```

3. Reload extension in `chrome://extensions/`

## Important Notes

- Chrome extensions **cannot** use `.env.local` files (server-side only)
- `config.js` is loaded before `content.js` via `manifest.json`
- Changes require extension reload to take effect

## Example Configurations

### Local Development

```javascript
API_BASE_URL: "http://localhost:3002/api"
```

### Vercel Deployment

```javascript
API_BASE_URL: "https://your-app.vercel.app/api"
```

### Custom Domain

```javascript
API_BASE_URL: "https://api.yourdomain.com/api"
```

## After Changing Config

1. Save `config.js`
2. Go to `chrome://extensions/`
3. Find "Meeting AI Assistant"
4. Click **Reload** (??)
5. Refresh any Google Meet tabs

Done! Extension will now use the new API URL.
