# Deployment Guide

## Overview

This guide covers deploying Globizs to production using Vercel and PostgreSQL.

## Prerequisites

- Vercel account (https://vercel.com)
- PostgreSQL database (Neon, Supabase, or similar)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial Globizs commit"
git push -u origin main
```

### 2. Set Up PostgreSQL Database

**Using Neon (recommended):**
1. Go to https://console.neon.tech
2. Create new project
3. Get connection string: `postgresql://user:password@host:5432/globizs`

**Using Supabase:**
1. Go to https://supabase.com
2. Create new project
3. Copy PostgreSQL connection string

### 3. Generate NextAuth Secret

```bash
# Generate secure random string
openssl rand -base64 32

# Example output: abc123def456... (copy this)
```

### 4. Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-generated-secret
   SESSION_MAX_AGE=2592000
   ```
4. Click Deploy

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### 5. Database Migration

After deployment, run migrations:

```bash
# Connect to your deployed instance
vercel env pull

# Run migrations
npm run db:push

# Seed production data (optional)
npm run db:seed
```

Or use Vercel's build script by adding to `package.json`:

```json
{
  "scripts": {
    "build": "next build && npm run db:push"
  }
}
```

### 6. Verify Deployment

1. Visit your Vercel deployment URL
2. Test sign in with demo@example.com / password123
3. Create a test schedule
4. Check database with Prisma Studio:
   ```bash
   DATABASE_URL=production_url npm run db:studio
   ```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| DATABASE_URL | Database connection | `postgresql://...` |
| NEXTAUTH_URL | Auth callback URL | `https://myapp.com` |
| NEXTAUTH_SECRET | JWT signing key | Generated random string |
| SESSION_MAX_AGE | Session duration (seconds) | `2592000` (30 days) |

## Security Best Practices

1. **Never commit `.env` files**
   - Use Vercel's environment variable dashboard
   - Keep NEXTAUTH_SECRET secure

2. **Use HTTPS**
   - Vercel provides free SSL certificates
   - Ensure NEXTAUTH_URL uses https://

3. **Database Security**
   - Use strong passwords
   - Restrict database access by IP
   - Enable SSL for PostgreSQL connections

4. **Regular Backups**
   - Enable automatic backups in PostgreSQL
   - Consider point-in-time recovery

## Performance Optimization

### Enable Image Optimization
Add to `next.config.js`:
```javascript
images: {
  unoptimized: false,
}
```

### Configure Caching
Headers are already optimized in Next.js 15.

### Monitor Performance
Use Vercel Analytics:
1. Go to Vercel dashboard
2. Click Analytics tab
3. Review Core Web Vitals

## Scaling Considerations

### Database Scaling
- PostgreSQL can handle thousands of concurrent users
- Monitor connection pool limits
- Use read replicas for high traffic

### CDN & Caching
- Vercel includes Edge Network by default
- Add cache headers to static assets
- Use ISR (Incremental Static Regeneration) for schedules

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Load test
ab -n 1000 -c 10 https://yourdomain.com/
```

## Troubleshooting Deployment

### Build Fails
```bash
# Check build logs in Vercel dashboard
vercel logs --prod

# Test build locally
npm run build

# Verify all files are committed
git status
```

### Database Connection Error
```bash
# Verify DATABASE_URL in Vercel
vercel env list

# Test connection
npx prisma db execute --stdin < /dev/null
```

### Authentication Not Working
```bash
# Check NEXTAUTH_URL matches deployment domain
# Verify NEXTAUTH_SECRET is set
vercel env list | grep NEXTAUTH

# Clear cookies and try again
```

## Updating After Deployment

### Deploying Updates

```bash
# Make code changes
git commit -am "Fix: update feature"
git push origin main

# Vercel automatically redeploys
# Monitor at https://vercel.com/dashboard
```

### Database Schema Changes

```bash
# Create migration
npm run db:migrate

# Apply migration to production
# After push, Vercel will sync schema if you have:
# "scripts": { "build": "prisma generate && next build" }
```

## Database Backup Strategy

### Manual Backup
```bash
# Backup PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Automated Backup
Most PostgreSQL providers offer:
- Daily automated backups
- Point-in-time recovery
- Backup retention policies

Enable in your provider's dashboard.

## SSL/HTTPS Configuration

Vercel automatically provides:
- Free SSL certificates (Let's Encrypt)
- Automatic renewal
- HTTPS enforced by default

No manual configuration needed!

## Domain Setup

### Using Custom Domain

1. **Add Domain to Vercel**
   - Dashboard → Settings → Domains
   - Add your custom domain

2. **Update DNS Records**
   - Point to Vercel nameservers
   - Or add CNAME/A records
   - Vercel provides DNS setup instructions

3. **Update NEXTAUTH_URL**
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```

## Monitoring & Logging

### Real-time Logs
```bash
# Stream production logs
vercel logs --follow

# Filter by search term
vercel logs api --follow
```

### Error Tracking
Add Sentry for production monitoring:
```bash
npm install @sentry/nextjs

# Configure in next.config.js
```

## CI/CD Pipeline

Vercel automatically provides:
- Preview deployments for pull requests
- Automatic production deployments on merge
- Environment-specific configurations
- Instant rollbacks

No additional setup needed!

## Cost Optimization

### Vercel Pricing
- **Hobby:** Free tier includes generous limits
- **Pro:** $20/month for additional features
- **Enterprise:** Custom pricing

### Database Cost
- **PostgreSQL Starter:** $10-20/month
- Most providers offer free tier for testing

### Total Estimated Cost
- **Development:** $0 (free tier)
- **Small Production:** $10-30/month
- **Scaling:** Increases with traffic

## Rollback Procedure

If deployment has issues:

```bash
# Via Vercel Dashboard
1. Go to Deployments tab
2. Click "..." on previous working deployment
3. Select "Promote to Production"

# Or via CLI
vercel rollback
```

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables set correctly
- [ ] NEXTAUTH_URL matches domain
- [ ] Demo account works
- [ ] Schedule creation/view works
- [ ] History modal displays schedules
- [ ] Logout functionality works
- [ ] Mobile responsive design verified
- [ ] Performance metrics acceptable
- [ ] Analytics enabled
- [ ] Backup strategy configured

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/learn/basics/deploying-nextjs-app)
- [Prisma Deployment](https://www.prisma.io/docs/guides/database/guide-migration-many-databases)
- [PostgreSQL Hosting](https://wiki.postgresql.org/wiki/PostgreSQL_hosting)

---

**Successfully deployed? Great! You're ready for production! 🚀**
