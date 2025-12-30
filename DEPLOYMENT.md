# Deployment Guide

## Quick Start - Vercel (Recommended)

Vercel is the fastest and easiest way to deploy Next.js applications.

### Step 1: Push to GitHub

```bash
cd meeting-ai
git init
git add .
git commit -m "Initial commit - Meeting AI Assistant"
git branch -M main
git remote add origin https://github.com/yourusername/meeting-ai.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `meeting-ai` repository
5. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Add Environment Variables

In Vercel project settings:

1. Go to **Settings** ? **Environment Variables**
2. Add:
   - Name: `OPENAI_API_KEY`
   - Value: `your_openai_api_key_here`
   - Environment: **Production**, **Preview**, **Development**

### Step 4: Deploy

Click **Deploy** button and wait ~2 minutes.

Your app will be live at: `https://your-project-name.vercel.app`

---

## Alternative: Manual Deployment

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd meeting-ai
vercel

# Add environment variable
vercel env add OPENAI_API_KEY production

# Deploy to production
vercel --prod
```

---

## Other Hosting Options

### Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variable: `OPENAI_API_KEY`

### AWS Amplify

1. Connect repository
2. Build settings are auto-detected
3. Add environment variable in app settings

### Self-Hosted (VPS/Docker)

```bash
# Build production
npm run build

# Start production server
npm start

# Or use PM2
npm install -g pm2
pm2 start npm --name "meeting-ai" -- start

# Setup Nginx reverse proxy
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Test file upload
- [ ] Test transcription with sample audio
- [ ] Verify PDF download works
- [ ] Check OpenAI API costs in dashboard
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

---

## Monitoring & Analytics

### Vercel Analytics (Free)

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking - Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Cost Management

### OpenAI API Limits

Set usage limits in OpenAI dashboard:

1. Go to [platform.openai.com/account/limits](https://platform.openai.com/account/limits)
2. Set monthly budget limit
3. Enable email notifications

### Estimated Costs

| Usage | Monthly Cost |
|-------|-------------|
| 10 meetings/month (30 min avg) | ~$2 |
| 50 meetings/month | ~$10 |
| 200 meetings/month | ~$40 |

---

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys** regularly
3. **Set rate limits** on API routes (optional)
4. **Enable CORS** if needed
5. **Use environment-specific** keys (dev/prod)

---

## Scaling Considerations

### If you get high traffic

1. **Add Rate Limiting**

```bash
npm install @upstash/ratelimit
```

1. **Add Redis Caching** for results

2. **Use Background Jobs** for long files

```bash
npm install bull redis
```

1. **Implement Queue System** for processing

2. **Add Authentication** to control access

---

## Custom Domain Setup

### Vercel

1. Go to project settings
2. Domains ? Add Domain
3. Enter your domain: `meeting.yourdomain.com`
4. Update DNS records as instructed

### DNS Configuration

Add these records at your domain provider:

```
Type: CNAME
Name: meeting (or @ for root)
Value: cname.vercel-dns.com
```

---

## Troubleshooting

### Build Fails

- Check all dependencies are installed
- Verify Node.js version (18+)
- Check build logs for specific errors

### API Calls Fail

- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI account has credits
- Review API usage in OpenAI dashboard

### 500 Internal Server Error

- Check server logs
- Verify all environment variables
- Test API routes individually

---

## Rollback

If deployment has issues:

```bash
# Vercel
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push
```

---

## Support

For deployment issues:

- Vercel: [vercel.com/support](https://vercel.com/support)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- OpenAI: [platform.openai.com/docs](https://platform.openai.com/docs)

---

**Deployment time**: ~5 minutes  
**First deploy**: Free on Vercel  
**Production ready**: ? Yes
