# ScatterBrainAI Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account
- Supabase project
- Domain name (scatterbrainai.com)

### Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial ScatterBrainAI platform"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework: Next.js
   - Root Directory: `./` (or select if in subdirectory)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Environment Variables

Add these in Vercel's project settings:

```bash
# Public (Client-side)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Private (Server-side)
CLAUDE_API_KEY=your_claude_api_key

# Optional (for future features)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Step 4: Configure Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add `scatterbrainai.com`
3. Add `www.scatterbrainai.com`
4. Update your domain's DNS:
   - A Record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`

### Step 5: Set Up Supabase

1. Create new Supabase project
2. Run migrations:
```sql
-- In Supabase SQL editor, run the migration file
-- Copy contents from supabase/migrations/001_add_trial_fields.sql
```

3. Enable Row Level Security:
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own thoughts" ON thoughts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own thoughts" ON thoughts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thoughts" ON thoughts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thoughts" ON thoughts
  FOR DELETE USING (auth.uid() = user_id);
```

4. Configure Auth settings:
   - Enable Email auth
   - Set redirect URLs:
     - Site URL: `https://scatterbrainai.com`
     - Redirect URLs: `https://scatterbrainai.com/app`

### Step 6: API Routes Configuration

The Claude API is called through Next.js API routes at `/api/analyze-content`. This keeps your API key secure on the server.

### Step 7: Post-Deployment Checklist

- [ ] Landing page loads at scatterbrainai.com
- [ ] "Create Your Brain" button works
- [ ] Authentication flow completes
- [ ] Trial countdown appears for new users
- [ ] Content analysis works
- [ ] Export functionality works
- [ ] All environment variables are set

## 🔧 Advanced Configuration

### Monitoring & Analytics

Add these services (optional):
1. **Vercel Analytics** - Built-in performance monitoring
2. **PostHog** or **Mixpanel** - User behavior analytics
3. **Sentry** - Error tracking

### Performance Optimization

1. Enable Vercel Edge Config for faster reads
2. Set up ISR (Incremental Static Regeneration) for blog pages
3. Configure image optimization

### Security Hardening

1. Set up rate limiting on API routes:
```typescript
// In api/analyze-content/route.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});
```

2. Add CORS restrictions for production
3. Implement CSP headers

## 📊 Monitoring Your Deployment

### Key Metrics to Track

1. **Conversion Funnel**
   - Landing → Sign Up
   - Sign Up → First Thought
   - Trial → Paid

2. **Performance**
   - Page load times < 3s
   - API response times < 1s
   - Uptime > 99.9%

3. **User Engagement**
   - Daily active users
   - Thoughts created per user
   - Export usage

### Debugging Common Issues

**Issue: API calls failing**
- Check Vercel function logs
- Verify environment variables
- Check API rate limits

**Issue: Authentication not working**
- Verify Supabase URL and anon key
- Check redirect URLs in Supabase
- Clear browser cookies

**Issue: Slow performance**
- Check Vercel Analytics
- Optimize images
- Enable caching headers

## 🚨 Emergency Procedures

### Rollback Deployment
```bash
# In Vercel dashboard
# Go to Deployments → Select previous working deployment → Promote to Production
```

### Database Backup
```bash
# Use Supabase dashboard
# Settings → Backups → Download
```

### API Key Rotation
1. Generate new key in provider dashboard
2. Update in Vercel environment variables
3. Redeploy (automatic)

## 📈 Scaling Considerations

### When You Hit 10k Users
1. Upgrade Supabase plan
2. Enable Vercel Pro for better limits
3. Consider dedicated Claude API agreement
4. Implement caching layer (Redis)

### Database Optimization
- Add indexes on frequently queried fields
- Implement database connection pooling
- Consider read replicas for analytics

## 🎉 Launch Checklist

### Pre-Launch (1 week before)
- [ ] All features tested in production
- [ ] Monitoring set up
- [ ] Support email configured
- [ ] Terms of Service and Privacy Policy live
- [ ] Payment processing tested (if enabled)

### Launch Day
- [ ] Remove any beta restrictions
- [ ] Announce on social media
- [ ] Monitor error logs closely
- [ ] Be ready to scale if needed

### Post-Launch (First week)
- [ ] Daily monitoring of key metrics
- [ ] Respond to user feedback quickly
- [ ] Fix any critical bugs immediately
- [ ] Plan first feature updates

## Support

For deployment issues:
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io
- Your email: [your-email]

---

Remember: Start small, monitor closely, and scale gradually. Good luck with your launch! 🚀