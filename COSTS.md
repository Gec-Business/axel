# Monthly Cost Analysis — Axel Social Media Auto-Poster (v2)

All costs estimated for Axel Network's expected usage: ~50-100 social media posts/month across 3 platforms, with AI content generation and media asset storage.

---

## Cost Summary

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **Netlify** | Free | **$0** | Hosting + binary asset storage (Blobs) |
| **Supabase** | Free | **$0** | PostgreSQL database for posts, campaigns, settings |
| **Claude API** | Pay-per-use | **$5 - $15** | AI content generation |
| **Cloudinary** | Free | **$0** | Large video storage |
| **GitHub Actions** | Free | **$0** | External cron (public repo) |
| **Meta APIs** | Free | **$0** | Facebook + Instagram posting |
| **LinkedIn API** | Free | **$0** | LinkedIn posting |
| **Domain** (optional) | Annual | **~$1/mo** | If using custom subdomain |
| | | | |
| **TOTAL** | | **$5 - $16/mo** | |

---

## Detailed Breakdown

### 1. Netlify — $0/month

With Supabase handling structured data, Netlify's load is reduced to hosting + serving binary assets.

**Free tier includes:**
- 100 GB bandwidth/month
- 300 build minutes/month
- 125K serverless function invocations/month

| Resource | Axel's Estimated Usage | Free Limit | Enough? |
|----------|----------------------|-----------|---------|
| Bandwidth | ~5-10 GB/month | 100 GB | Yes |
| Build minutes | ~50 min/month | 300 min | Yes |
| Function invocations | ~3,000/month | 125,000 | Yes |

**Note:** We no longer use Netlify Scheduled Functions (moved to GitHub Actions), so the 30-second timeout limitation doesn't apply.

### 2. Supabase — $0/month

**Free tier includes:**
- 500 MB database storage
- 50,000 rows
- 2 GB bandwidth
- Unlimited API requests
- Daily backups (7-day retention)
- Row-level security

| Resource | Axel's Estimated Usage | Free Limit | Enough? |
|----------|----------------------|-----------|---------|
| Database size | ~10-50 MB (posts, campaigns, audit log) | 500 MB | Yes |
| Rows | ~5,000/year (posts + campaigns + audit entries) | 50,000 | Yes |
| API bandwidth | ~1-5 GB/month | 2 GB | Likely yes |

**Verdict:** Free tier is sufficient for 2-3+ years of operation.

**When to upgrade:** Supabase Pro ($25/mo) if database exceeds 500 MB or if you need point-in-time recovery or more than 50K rows. Unlikely before 2028 at current volume.

### 3. Claude API (Anthropic) — $5 to $15/month

Used for AI-generated bilingual content (Georgian + English).

**Pricing (Claude Sonnet 4, recommended for content generation):**
- Input: $3 / million tokens
- Output: $15 / million tokens

**Monthly estimate:**
| Scenario | Sessions/Month | Cost |
|----------|---------------|------|
| Light use (2-3 batches) | 3 | ~$0.20 |
| Normal use (weekly batches) | 4-5 | ~$0.35 |
| Heavy use (daily edits + regeneration) | 20 | ~$1.35 |

**With additional usage** (hashtag suggestions, schedule optimization, content rewriting): $5-15/month total.

**Cost control:** Set a monthly spending limit of $20 in the Anthropic Console. The app also enforces a 10 generation requests/day rate limit.

### 4. Cloudinary — $0/month

**Updated free tier (2026):**
- 10 GB managed storage
- 20 GB bandwidth/month
- 300,000 total images/videos

**Axel's estimated usage:**
- Video uploads: ~5-10 videos/month, averaging 20-50 MB each
- Monthly storage growth: ~200-500 MB
- Bandwidth: ~2-5 GB/month

**Important:** Cloudinary suspends (not charges) on free tier overage. If this happens, video serving stops until the next month. Low risk at Axel's volume.

### 5. GitHub Actions — $0/month

Free for public repositories:
- 2,000 minutes/month
- Axel's usage: ~2 minutes/day (cron + backup) = ~60 min/month

### 6. Meta APIs + LinkedIn API — $0/month

Free for publishing to pages/accounts you manage. Rate limits (25 FB posts/day, 100 IG posts/day) are far above Axel's needs.

### 7. Custom Domain (Optional) — ~$12/year

Subdomain of `axelnetwork.org` pointing to Netlify: **free** (DNS config only).

---

## Cost Scenarios

### Scenario A: Minimal (just getting started)
| Item | Cost |
|------|------|
| Netlify Free | $0 |
| Supabase Free | $0 |
| Claude API (light use) | $5 |
| Cloudinary Free | $0 |
| GitHub Actions Free | $0 |
| **Total** | **$5/month** |

### Scenario B: Normal Operations
| Item | Cost |
|------|------|
| Netlify Free | $0 |
| Supabase Free | $0 |
| Claude API (weekly batches + edits) | $10 |
| Cloudinary Free | $0 |
| GitHub Actions Free | $0 |
| **Total** | **$10/month** |

### Scenario C: Heavy Use
| Item | Cost |
|------|------|
| Netlify Free | $0 |
| Supabase Free | $0 |
| Claude API (daily use) | $15 |
| Cloudinary Free | $0 |
| GitHub Actions Free | $0 |
| **Total** | **$15/month** |

---

## Cost Comparison with Alternatives

| Solution | Monthly Cost | Limitations |
|----------|-------------|-------------|
| **This system** | **$5-15** | Full control, custom for Axel, bilingual, AI-powered |
| Buffer (Team plan) | $120 | No AI generation, no asset studio, no approval workflow |
| Hootsuite (Professional) | $99 | Limited AI, 1 user, no custom workflows |
| Sprout Social | $249 | Enterprise features Axel doesn't need |
| Later (Growth) | $40 | Instagram-focused, limited LinkedIn, no bilingual |

**This custom system costs 3-25x less** than commercial alternatives while being tailored exactly to Axel's needs.

---

## When Costs Might Increase

| Trigger | Action | Additional Cost |
|---------|--------|----------------|
| Database >500 MB or >50K rows | Upgrade Supabase to Pro | +$25/mo |
| High dashboard traffic (>100 GB) | Upgrade Netlify to Starter | +$19/mo |
| Very heavy AI generation | Increase API budget | +$10-20/mo |
| Video storage >10 GB | Upgrade Cloudinary | +$89/mo |
| Meta auto-boosting (Phase 2) | Ad spend budget | Variable (Axel decides) |

**Estimated max monthly cost** (everything upgraded): ~$160/mo — still less than a single Sprout Social license.

---

## One-Time Setup Costs

| Item | Cost | Notes |
|------|------|-------|
| Meta App Review | $0 | Free, takes 2-7 business days. Requires screen recordings. |
| LinkedIn App Setup | $0 | Auto-approved for company pages |
| Supabase Account | $0 | Free signup |
| Cloudinary Account | $0 | Free signup |
| Anthropic API Account | $0 | Free signup, pay-per-use |
| GitHub Repository | $0 | Public repo (already created) |
| Development time | Variable | Building the system |

---

## v1 → v2 Cost Change

| Change | v1 Cost | v2 Cost | Why |
|--------|---------|---------|-----|
| Added Supabase | N/A | $0 | Free tier. Replaces Blobs for data — much more reliable |
| Removed Netlify Pro need | $0-19 | $0 | External cron eliminates need for Background Functions |
| Added GitHub Actions | N/A | $0 | Free for public repos |
| **Net change** | $5-35/mo | $5-15/mo | **Actually cheaper** in v2 while being more reliable |
