# Monthly Cost Analysis — Axel Social Media Auto-Poster

All costs estimated for Axel Network's expected usage: ~50-100 social media posts/month across 3 platforms, with AI content generation and media asset storage.

---

## Cost Summary

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **Netlify** | Free / Starter | **$0 - $19** | Free tier likely sufficient |
| **Claude API** | Pay-per-use | **$5 - $15** | AI content generation |
| **Cloudinary** | Free | **$0** | Video storage |
| **Meta APIs** | Free | **$0** | Facebook + Instagram posting |
| **LinkedIn API** | Free | **$0** | LinkedIn posting |
| **Domain** (optional) | Annual | **~$1/mo** | If using custom subdomain |
| | | | |
| **TOTAL** | | **$5 - $35/mo** | |

---

## Detailed Breakdown

### 1. Netlify — $0 to $19/month

**Free tier includes:**
- 100GB bandwidth/month
- 300 build minutes/month
- 125K serverless function invocations/month
- Netlify Blobs: 1K read/write operations per day
- 1 scheduled function (our daily cron)

**Will the free tier be enough for Axel?**

| Resource | Axel's Estimated Usage | Free Limit | Enough? |
|----------|----------------------|-----------|---------|
| Bandwidth | ~5-10 GB/month (dashboard + asset serving) | 100 GB | Yes |
| Build minutes | ~50 min/month (deploys) | 300 min | Yes |
| Function invocations | ~3,000/month (API calls from dashboard + cron) | 125,000 | Yes |
| Blob operations | ~200-500/day (post/asset CRUD) | 1,000/day | Yes |

**Verdict:** Free tier should be sufficient. If the dashboard gets heavy use or many large assets are served through Netlify, upgrading to **Starter ($19/mo)** provides 1TB bandwidth and more headroom.

**Risk:** If social platforms fetch assets frequently (e.g., link previews, re-scraping), bandwidth could increase. Cloudinary for large media mitigates this.

### 2. Claude API (Anthropic) — $5 to $15/month

Used for AI-generated bilingual content (Georgian + English).

**Pricing (Claude Sonnet 4, recommended for content generation):**
- Input: $3 / million tokens
- Output: $15 / million tokens

**Estimated usage per content generation session:**
- Brand voice context + pillar guidelines: ~2,000 tokens input
- Request (date range, pillar, campaign context): ~500 tokens input
- Generated batch of 10-15 posts (both languages): ~4,000 tokens output

**Monthly estimate:**
| Scenario | Sessions/Month | Input Tokens | Output Tokens | Cost |
|----------|---------------|-------------|---------------|------|
| Light use (2-3 batches) | 3 | ~7,500 | ~12,000 | ~$0.20 |
| Normal use (weekly batches) | 4-5 | ~12,500 | ~20,000 | ~$0.35 |
| Heavy use (daily edits + regeneration) | 20 | ~50,000 | ~80,000 | ~$1.35 |

**Realistic monthly cost: $1-5** for content generation alone.

**Additional AI usage (optional):**
- Hashtag suggestions: ~$0.50/month
- Schedule optimization: ~$0.50/month
- Content editing/rewriting requests: ~$1-5/month

**Total AI budget: $5-15/month** with generous margin.

**Cost control:** Set a monthly spending limit of $20 in the [Anthropic Console](https://console.anthropic.com/) to prevent surprises.

### 3. Cloudinary — $0/month

**Free tier includes:**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

**Axel's estimated usage:**
- Video uploads: ~5-10 videos/month, averaging 20-50 MB each
- Monthly storage growth: ~200-500 MB
- Bandwidth: ~2-5 GB/month (social platforms fetching videos)

**Time until free tier runs out:**
- At 500 MB/month growth: ~50 months (4+ years) before hitting 25 GB storage
- Bandwidth resets monthly: 5 GB/month usage is well within 25 GB limit

**Verdict:** Free tier will last years for Axel's volume.

### 4. Meta APIs (Facebook + Instagram) — $0/month

Meta Graph API is free for publishing to pages you manage. No rate limits concerns for Axel's volume (~50-100 posts/month total across both platforms).

### 5. LinkedIn API — $0/month

LinkedIn Marketing API is free for posting to company pages. Share on LinkedIn product provides sufficient access.

### 6. Custom Domain (Optional) — ~$12/year

If Axel wants `social.axelnetwork.org` instead of `axel-social.netlify.app`:
- Subdomain pointing to Netlify: **free** (just DNS configuration)
- If buying a new domain: ~$12/year for a `.org` domain

---

## Cost Scenarios

### Scenario A: Minimal (just getting started)
| Item | Cost |
|------|------|
| Netlify Free | $0 |
| Claude API (light use) | $5 |
| Cloudinary Free | $0 |
| **Total** | **$5/month** |

### Scenario B: Normal Operations
| Item | Cost |
|------|------|
| Netlify Free | $0 |
| Claude API (weekly batches + edits) | $10 |
| Cloudinary Free | $0 |
| **Total** | **$10/month** |

### Scenario C: Heavy Use + Starter Netlify
| Item | Cost |
|------|------|
| Netlify Starter | $19 |
| Claude API (daily use) | $15 |
| Cloudinary Free | $0 |
| **Total** | **$34/month** |

---

## Cost Comparison

For context, here's what alternatives would cost:

| Solution | Monthly Cost | Limitations |
|----------|-------------|-------------|
| **This system** | **$5-35** | Full control, custom for Axel |
| Buffer (Team plan) | $120 | No AI generation, no asset studio, 2000 scheduled posts |
| Hootsuite (Professional) | $99 | Limited AI, 1 user, no custom workflows |
| Sprout Social | $249 | Enterprise features Axel doesn't need |
| Later (Growth) | $40 | Instagram-focused, limited LinkedIn |

**This custom system costs 3-25x less** than commercial alternatives and is tailored exactly to Axel's needs (bilingual Georgian/English, content pillars, approval workflow).

---

## When Costs Might Increase

| Trigger | Action | New Cost |
|---------|--------|----------|
| High dashboard traffic (>100GB bandwidth) | Upgrade Netlify to Starter | +$19/mo |
| Very heavy AI generation | Increase API budget | +$10-20/mo |
| Video storage exceeds 25GB (unlikely before 2030) | Upgrade Cloudinary to Plus ($89/mo) | +$89/mo |
| Meta auto-boosting (Phase 2) | Ad budget is separate | Variable (Axel decides budget) |

---

## One-Time Setup Costs

| Item | Cost | Notes |
|------|------|-------|
| Meta App Review | $0 | Free, but takes 1-5 business days |
| LinkedIn App Setup | $0 | Auto-approved for company pages |
| Cloudinary Account | $0 | Free signup |
| Anthropic API Account | $0 | Free signup, pay-per-use |
| Development time | Variable | Building the system |
