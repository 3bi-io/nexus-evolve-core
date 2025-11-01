# 🚀 Production Launch Checklist

**Project:** Oneiros.me  
**Target Launch Date:** [Set Date]  
**Status:** Pre-Launch Preparation

---

## PRE-LAUNCH CRITICAL TASKS

### 1. 🔐 Security Hardening (CRITICAL - Do First)

#### Supabase Dashboard Configuration
Access your Supabase Dashboard at: https://supabase.com/dashboard/project/coobieessxvnujkkiadc

- [ ] **Enable Leaked Password Protection**
  - Go to Authentication > Settings
  - Enable "Leaked Password Protection"
  - This prevents users from using compromised passwords

- [ ] **Configure CORS**
  - Go to Settings > API
  - Update "CORS Allowed Origins" to your production domain only
  - Remove `*` or wildcard entries
  - Add: `https://yourdomain.com` (replace with actual domain)

- [ ] **Review Extensions Schema**
  - Go to Database > Extensions
  - Verify `pgcrypto` is in `extensions` schema (not `public`)
  - Verify `vector` is in `extensions` schema (not `public`)

- [ ] **Set Production URL**
  - Go to Authentication > URL Configuration
  - Set "Site URL" to your production domain
  - Add production domain to "Redirect URLs"
  - Remove development URLs from "Redirect URLs"

- [ ] **API Key Rotation Plan**
  - Document current keys
  - Plan rotation schedule (every 90 days recommended)
  - Set calendar reminders

#### Code Updates Required
- [ ] Update CORS in `supabase/functions/_shared/cors.ts`
  ```typescript
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://yourdomain.com', // Change from '*'
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  ```

- [ ] Run Final Security Scan
  ```bash
  # This will check for:
  # - Missing RLS policies
  # - Public tables with PII
  # - Weak security configurations
  ```

- [ ] Review All RLS Policies
  - Check every table has RLS enabled
  - Verify policies are restrictive (not `true` conditions)
  - Test policies with different user scenarios

#### Security Checklist
- [ ] All tables with user data have RLS enabled
- [ ] No public access to PII (emails, phone numbers, addresses)
- [ ] Edge functions verify JWT tokens (unless public)
- [ ] No API keys or secrets in client-side code
- [ ] CORS restricted to production domain
- [ ] Error messages don't expose sensitive data
- [ ] SQL injection prevention (using parameterized queries)
- [ ] Rate limiting configured for auth endpoints

---

### 2. 📊 Monitoring & Observability (HIGH PRIORITY)

#### Error Tracking
- [x] Error tracking library implemented (`src/lib/error-tracking.ts`)
- [ ] Test error reporting in staging
- [ ] Configure alert thresholds
- [ ] Set up email/Slack notifications for critical errors
- [ ] Test unhandled errors are caught
- [ ] Verify error logs include context (user, URL, stack trace)

#### Performance Monitoring
- [x] Performance monitoring implemented (`src/lib/performance-monitoring.ts`)
- [ ] Set performance budgets:
  - FCP < 1.8s
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - TTFB < 600ms
- [ ] Configure performance alerts
- [ ] Test performance tracking on mobile
- [ ] Verify Core Web Vitals reporting

#### Uptime Monitoring
- [ ] Choose uptime monitoring service:
  - Option 1: UptimeRobot (free tier available)
  - Option 2: Pingdom
  - Option 3: Better Uptime
- [ ] Set up monitoring for:
  - Main app (/)
  - API endpoints (/chat, /voice-agent)
  - Health check endpoint
- [ ] Configure alerts (email/SMS for downtime)
- [ ] Set check interval (1-5 minutes)

#### Analytics Dashboard
- [ ] Review user event tracking
- [ ] Verify feature usage tracking works
- [ ] Set up custom dashboards:
  - User acquisition funnel
  - Feature adoption rates
  - Error frequency trends
  - Performance metrics
- [ ] Configure data retention policy

---

### 3. 🔍 SEO & Social Optimization (HIGH PRIORITY)

#### Meta Tags & OG Images
- [x] Enhanced SEO component with page-specific metadata
- [x] Structured data (JSON-LD) implemented
- [x] Updated sitemap.xml with all routes
- [ ] Generate custom OG images for key pages:
  - Landing page (/)
  - Voice Agent (/voice-agent)
  - Agent Marketplace (/agent-marketplace)
  - Pricing (/pricing)
  - Social Intelligence (/social-intelligence)
- [ ] Test social media cards:
  - Facebook Sharing Debugger
  - Twitter Card Validator
  - LinkedIn Post Inspector

#### Search Engine Optimization
- [ ] Submit sitemap to search engines:
  - Google Search Console
  - Bing Webmaster Tools
- [ ] Verify robots.txt is correct
- [ ] Add `robots` meta tag to all pages
- [ ] Implement canonical URLs (check all pages)
- [ ] Optimize meta descriptions (under 160 chars)
- [ ] Add alt text to all images
- [ ] Use semantic HTML (`<header>`, `<main>`, `<article>`)
- [ ] Single H1 per page with target keyword

#### Structured Data
- [x] Base structured data implemented
- [ ] Add page-specific structured data:
  - FAQPage for common questions
  - BreadcrumbList for navigation
  - Product schema for pricing page
  - SoftwareApplication for app pages
- [ ] Test structured data with Google Rich Results Test

---

### 4. ⚡ Performance Optimization (HIGH PRIORITY)

#### Code Splitting & Lazy Loading
- [x] Basic code splitting configured (vite.config.ts)
- [ ] Implement React.lazy for heavy routes:
  ```typescript
  const AgentMarketplace = lazy(() => import('./pages/AgentMarketplace'));
  const MultimodalStudio = lazy(() => import('./pages/MultimodalStudio'));
  const Analytics = lazy(() => import('./pages/Analytics'));
  ```
- [ ] Add Suspense fallbacks with loading states
- [ ] Lazy load heavy components:
  - Charts (Recharts)
  - Rich text editors
  - Image galleries
  - Video players

#### Image Optimization
- [ ] Convert images to WebP format
- [ ] Add blur placeholders for images
- [ ] Implement lazy loading for images
  ```html
  <img loading="lazy" src="..." alt="..." />
  ```
- [ ] Optimize image sizes:
  - Desktop: max 1920px width
  - Mobile: max 768px width
  - Thumbnails: max 300px width
- [ ] Use responsive images:
  ```html
  <picture>
    <source srcset="image-mobile.webp" media="(max-width: 768px)">
    <img src="image-desktop.webp" alt="...">
  </picture>
  ```

#### Font Optimization
- [x] Preconnect to Google Fonts (in SEO.tsx)
- [ ] Use font-display: swap for faster rendering
- [ ] Subset fonts (only load needed characters/weights)
- [ ] Consider self-hosting fonts for better control

#### Bundle Optimization
- [x] Vendor chunk splitting configured
- [ ] Run bundle analyzer:
  ```bash
  npm run build
  npx vite-bundle-visualizer
  ```
- [ ] Remove unused dependencies
- [ ] Tree-shake unused code
- [ ] Target bundle size: < 500KB initial load

#### Database Optimization
- [ ] Review slow queries in Supabase
- [ ] Add indexes for frequently queried columns:
  ```sql
  CREATE INDEX idx_user_events_user_id ON user_events(user_id);
  CREATE INDEX idx_user_events_event_type ON user_events(event_type);
  CREATE INDEX idx_sessions_user_id ON sessions(user_id);
  ```
- [ ] Configure connection pooling (if needed)
- [ ] Set up query result caching
- [ ] Review and optimize complex joins

---

### 5. 🧪 Testing & Quality Assurance (CRITICAL)

#### Functional Testing
- [ ] Test all critical user flows:
  - Sign up → Onboarding → First chat
  - Login → Resume session → Send message
  - Create agent → Test agent → Save agent
  - Browse marketplace → Deploy agent
  - Upgrade to paid plan → Payment
  - Invite friend → Track referral
- [ ] Test on multiple browsers:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)
- [ ] Test on multiple devices:
  - Desktop (Windows, Mac)
  - Tablet (iPad, Android)
  - Mobile (iPhone, Android)

#### Authentication Testing
- [ ] Test sign up with email/password
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test password reset flow
- [ ] Test email verification (if enabled)
- [ ] Test session persistence
- [ ] Test logout functionality
- [ ] Test expired session handling

#### Edge Cases
- [ ] Test with slow network (3G simulation)
- [ ] Test with no network (offline mode)
- [ ] Test with ad blockers enabled
- [ ] Test with JavaScript disabled (graceful degradation)
- [ ] Test with screen readers (basic accessibility)
- [ ] Test with very long text inputs
- [ ] Test with special characters in inputs
- [ ] Test concurrent sessions (same user, multiple tabs)

#### Load Testing
- [ ] Use load testing tool:
  - Option 1: K6
  - Option 2: Artillery
  - Option 3: Locust
- [ ] Simulate 100+ concurrent users
- [ ] Test edge function performance under load
- [ ] Test database performance under load
- [ ] Monitor response times during load test
- [ ] Identify bottlenecks and optimize

---

### 6. 📧 Email & Communication (MEDIUM PRIORITY)

#### Email Configuration
- [ ] Verify Supabase email settings:
  - Go to Authentication > Email Templates
  - Customize email templates with branding
  - Test confirmation email
  - Test password reset email
  - Test magic link email
- [ ] Configure custom SMTP (optional):
  - Use SendGrid, Mailgun, or AWS SES
  - Better deliverability than default
  - Track email opens/clicks
- [ ] Add SPF and DKIM records to domain
- [ ] Test email deliverability with Mail Tester

#### Support Channels
- [ ] Set up support email (support@yourdomain.com)
- [ ] Create help documentation
- [ ] Set up customer support tool:
  - Option 1: Intercom
  - Option 2: Zendesk
  - Option 3: Plain (simple, modern)
- [ ] Add live chat widget (optional)
- [ ] Create FAQ page
- [ ] Document common issues and solutions

---

### 7. ⚙️ Infrastructure & DevOps (MEDIUM PRIORITY)

#### Backup & Disaster Recovery
- [ ] Enable daily Supabase backups:
  - Go to Settings > Backups
  - Verify automatic backups are enabled
  - Test restore process
- [ ] Document recovery procedures
- [ ] Set up off-site backups (optional)
- [ ] Create runbook for common issues

#### Cron Jobs
- [ ] Verify cron jobs are scheduled:
  - Daily credit reset
  - Weekly analytics aggregation
  - Monthly subscription renewals
- [ ] Test cron job execution
- [ ] Set up monitoring for cron jobs
- [ ] Configure failure alerts

#### Cost Monitoring
- [ ] Set up billing alerts in Supabase:
  - Go to Settings > Billing
  - Set usage alerts at 50%, 75%, 90%
- [ ] Monitor edge function usage
- [ ] Monitor database size
- [ ] Monitor bandwidth usage
- [ ] Review and optimize costs monthly

---

### 8. 📱 Mobile App (if deploying native)

#### PWA Deployment
- [x] PWA configured and working
- [ ] Test install prompt on Android
- [ ] Test install prompt on iOS (Add to Home Screen)
- [ ] Test offline functionality
- [ ] Test app update mechanism
- [ ] Verify push notifications work (if enabled)

#### Native App Deployment (Optional)
- [ ] Follow `NATIVE_APP_DEPLOYMENT.md` guide
- [ ] Build iOS app with Xcode
- [ ] Build Android app with Android Studio
- [ ] Submit to App Store
- [ ] Submit to Play Store
- [ ] Monitor app store reviews

---

### 9. 🎯 Marketing & Launch (POST-LAUNCH)

#### Pre-Launch Marketing
- [ ] Announce launch date
- [ ] Create launch announcement blog post
- [ ] Prepare social media posts
- [ ] Reach out to press/media
- [ ] Create demo video
- [ ] Update LinkedIn/Twitter profiles
- [ ] Prepare Product Hunt launch

#### Launch Day
- [ ] Publish announcement
- [ ] Post on social media
- [ ] Submit to Product Hunt
- [ ] Share on relevant communities (Reddit, Hacker News)
- [ ] Email newsletter subscribers
- [ ] Monitor for issues closely
- [ ] Respond to feedback promptly

#### Post-Launch
- [ ] Monitor analytics daily (first week)
- [ ] Track user feedback
- [ ] Fix bugs promptly
- [ ] Plan content marketing strategy
- [ ] Set up blog/newsletter
- [ ] Create case studies
- [ ] Encourage user reviews

---

### 10. 📋 Legal & Compliance (MEDIUM PRIORITY)

#### Privacy & Terms
- [ ] Review Privacy Policy (already at /privacy)
- [ ] Review Terms of Service (already at /terms)
- [ ] Ensure GDPR compliance (if EU users)
- [ ] Add cookie consent banner (if needed)
- [ ] Add data deletion option
- [ ] Document data retention policy

#### GDPR Compliance (if targeting EU)
- [ ] Add cookie consent banner
- [ ] Implement "Right to be forgotten"
- [ ] Add data export functionality
- [ ] Update Privacy Policy with GDPR details
- [ ] Appoint Data Protection Officer (if required)

---

## LAUNCH DAY RUNBOOK

### T-1 Day (Day Before Launch)
1. Run full test suite
2. Verify all monitoring is active
3. Check all alerts are configured
4. Review error logs (should be clean)
5. Test backup/restore procedure
6. Prepare social media posts
7. Sleep well! 😴

### Launch Day - Hour 0
1. ✅ Final smoke test on production
2. ✅ Verify monitoring dashboards are live
3. ✅ Post launch announcement
4. ✅ Share on social media
5. ✅ Monitor error logs closely
6. ✅ Watch performance metrics

### Launch Day - Hour 1-4
- Monitor error rates (target: < 1%)
- Monitor response times (target: < 2s)
- Check for any security issues
- Respond to user feedback
- Fix any critical bugs immediately

### Launch Day - Hour 4-24
- Continue monitoring
- Track user signups
- Monitor conversion funnel
- Address non-critical bugs
- Engage with users on social media
- Collect user feedback

### Week 1 Post-Launch
- Daily monitoring of all metrics
- Daily review of user feedback
- Release bug fixes as needed
- Monitor for scaling issues
- Track key metrics:
  - User signups
  - Daily active users
  - Conversion rate
  - Feature adoption
  - Error rate
  - Performance metrics

---

## SUCCESS METRICS

### Technical Metrics
- ✅ Uptime: > 99.9%
- ✅ Error rate: < 1%
- ✅ Page load time: < 2s (3G)
- ✅ API response time: < 500ms (p95)
- ✅ Lighthouse score: > 90
- ✅ Core Web Vitals: All "Good"

### Business Metrics
- Track daily/weekly signups
- Track activation rate (completed onboarding)
- Track conversion rate (free → paid)
- Track retention rate (Day 1, Day 7, Day 30)
- Track referral rate
- Track feature adoption rates

---

## EMERGENCY CONTACTS

**Development Team:**
- Lead Developer: [Your name/email]
- DevOps: [Name/email]

**External Services:**
- Supabase Support: https://supabase.com/dashboard/support
- Domain Registrar: [Your registrar]
- Hosting Provider: Lovable/Vercel

**Escalation Path:**
1. Check error monitoring dashboard
2. Check Supabase status page
3. Review recent deploys
4. Contact Supabase support
5. Roll back if needed

---

## POST-LAUNCH OPTIMIZATION PLAN

### Week 1-2
- Fix any critical bugs
- Address user feedback
- Optimize performance bottlenecks
- Improve onboarding based on analytics

### Week 3-4
- A/B test key features
- Optimize conversion funnel
- Improve SEO based on search console data
- Plan next feature release

### Month 2
- Major feature updates
- Content marketing push
- Community building
- Scale infrastructure if needed

---

## ROLLBACK PLAN

If critical issues occur:

1. **Immediate Actions:**
   - Disable affected features
   - Post status update
   - Alert all users (if needed)

2. **Investigation:**
   - Check error logs
   - Review recent changes
   - Identify root cause

3. **Rollback:**
   - Revert to last stable version
   - Restore database if needed
   - Verify functionality

4. **Communication:**
   - Update status page
   - Notify affected users
   - Post-mortem analysis

---

## FINAL PRE-LAUNCH CHECKLIST

- [ ] All CRITICAL tasks completed
- [ ] All HIGH PRIORITY tasks completed
- [ ] Security scan passed
- [ ] Performance tests passed
- [ ] All monitoring active
- [ ] Support channels ready
- [ ] Marketing materials prepared
- [ ] Team briefed on launch plan
- [ ] Rollback plan tested
- [ ] Emergency contacts documented

---

**Ready to Launch? 🚀**

Once all critical and high-priority tasks are complete, you're ready to launch!

Remember: Launch is just the beginning. Plan for continuous improvement, rapid iteration, and always prioritize user feedback.

Good luck! 🎉
