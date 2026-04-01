# Setup Guide — Axel Social Media Auto-Poster

This guide walks through every step needed to connect this system to Axel Network's social media accounts and deploy it.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Facebook & Instagram Setup (Meta)](#2-facebook--instagram-setup-meta)
3. [LinkedIn Setup](#3-linkedin-setup)
4. [Cloudinary Setup (Video Storage)](#4-cloudinary-setup-video-storage)
5. [Claude API Setup (AI Content)](#5-claude-api-setup-ai-content)
6. [Netlify Deployment](#6-netlify-deployment)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Testing Checklist](#8-testing-checklist)
9. [Brand Voice Approval](#9-brand-voice-approval)

---

## 1. Prerequisites

Before starting, make sure you have:

- [ ] Admin access to Axel Network's **Facebook Page**
- [ ] Admin access to Axel Network's **Instagram Business Account** (connected to the Facebook Page)
- [ ] Admin access to Axel Network's **LinkedIn Company Page**
- [ ] A **Netlify account** (free tier is sufficient to start — see [COSTS.md](COSTS.md))
- [ ] A **GitHub account** with access to this repository
- [ ] Node.js 18+ installed locally (for development)

---

## 2. Facebook & Instagram Setup (Meta)

### 2.1 Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Log in with an account that has admin access to Axel's Facebook Page
3. Click **"My Apps"** → **"Create App"**
4. Select **"Business"** type
5. Name it: `Axel Social Poster`
6. Select Axel's Business Manager if available

### 2.2 Add Required Products

In the App Dashboard, add these products:
- **Facebook Login for Business**
- **Instagram Graph API** (under "Add Products")

### 2.3 Get Facebook Page ID

1. Go to your Facebook Page
2. Click **About** → scroll to **Page ID** (numeric string)
3. Or use Graph API Explorer: `GET /me/accounts` → find the page → copy `id`
4. Save this as `META_PAGE_ID`

### 2.4 Get a Long-Lived Page Access Token

**Step 1: Get a User Access Token**
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click **"Generate Access Token"**
4. Grant these permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_read_user_content`
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `business_management`

**Step 2: Exchange for Long-Lived Token**
```
GET https://graph.facebook.com/v25.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id=YOUR_APP_ID&
  client_secret=YOUR_APP_SECRET&
  fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
```

**Step 3: Get Page Token from Long-Lived User Token**
```
GET https://graph.facebook.com/v25.0/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN
```

Find Axel's page in the response. The `access_token` field is your **never-expiring Page Access Token**.
Save this as `META_PAGE_TOKEN`.

### 2.5 Get Instagram Business Account ID

```
GET https://graph.facebook.com/v25.0/META_PAGE_ID?fields=instagram_business_account&access_token=META_PAGE_TOKEN
```

The response contains `instagram_business_account.id`. Save this as `META_IG_ACCOUNT_ID`.

### 2.6 Required Permissions Summary

| Permission | Why |
|-----------|-----|
| `pages_manage_posts` | Post to Facebook Page |
| `instagram_content_publish` | Post to Instagram |
| `instagram_basic` | Read Instagram account info |
| `pages_read_engagement` | Check post status |
| `business_management` | Business account access |

### 2.7 App Review (for Production)

For production use, Meta requires app review for these permissions. Submit your app for review with:
- A description of the auto-posting use case
- Screen recordings showing how the dashboard creates and publishes posts
- Privacy policy URL (can be on axelnetwork.org)

**Timeline:** Meta review typically takes 1-5 business days.

---

## 3. LinkedIn Setup

### 3.1 Create a LinkedIn App

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers/)
2. Click **"Create app"**
3. Fill in:
   - **App name:** `Axel Social Poster`
   - **LinkedIn Page:** Select Axel Network's company page
   - **App logo:** Upload Axel's logo
4. Save the app

### 3.2 Get Credentials

From the app's **Auth** tab:
- Copy **Client ID** → save as `LINKEDIN_CLIENT_ID`
- Copy **Client Secret** → save as `LINKEDIN_CLIENT_SECRET`

### 3.3 Request Required Products

In the **Products** tab, request access to:
- **Share on LinkedIn** (for posting to the company page)
- **Sign In with LinkedIn using OpenID Connect** (for OAuth)

These are usually auto-approved for verified company pages.

### 3.4 Configure OAuth Redirect

In the **Auth** tab → **OAuth 2.0 settings**:
- Add redirect URL: `https://YOUR-NETLIFY-SITE.netlify.app/api/linkedin/callback`
- For local development, also add: `http://localhost:3000/api/linkedin/callback`

### 3.5 Get Organization ID

1. Go to Axel Network's LinkedIn Company Page
2. Click **Admin tools** → look at the URL
3. The URL contains the organization ID (numeric): `linkedin.com/company/ORGANIZATION_ID/`
4. Save as `LINKEDIN_ORG_ID`

### 3.6 Connect LinkedIn from Dashboard

After deployment:
1. Go to `/dashboard/settings`
2. Click **"Connect LinkedIn"**
3. Authorize the app → tokens are stored automatically
4. Tokens auto-refresh — no manual renewal needed

---

## 4. Cloudinary Setup (Video Storage)

Cloudinary is used for storing large video files (>10MB) since Netlify Blobs has size limits.

### 4.1 Create Account

1. Go to [cloudinary.com](https://cloudinary.com/) → Sign up (free tier)
2. Free tier includes: **25GB storage**, **25GB bandwidth/month**

### 4.2 Get Credentials

From the Cloudinary Dashboard:
- **Cloud name** → save as `CLOUDINARY_CLOUD_NAME`
- **API Key** → save as `CLOUDINARY_API_KEY`
- **API Secret** → save as `CLOUDINARY_API_SECRET`

### 4.3 Create Upload Preset (Optional)

For unsigned uploads from the dashboard:
1. Go to **Settings** → **Upload**
2. Create an **unsigned upload preset** named `axel-assets`

---

## 5. Claude API Setup (AI Content)

The system uses Claude API to generate bilingual content (Georgian + English).

### 5.1 Get API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account or sign in
3. Go to **API Keys** → **Create Key**
4. Save as `ANTHROPIC_API_KEY`

### 5.2 Billing

- Claude API uses pay-per-use pricing
- Estimated cost: $5-15/month for Axel's volume (see [COSTS.md](COSTS.md))
- Set a monthly spending limit in the Anthropic console

---

## 6. Netlify Deployment

### 6.1 Connect Repository

1. Log in to [netlify.com](https://netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select this GitHub repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** `netlify/functions`

### 6.2 Set Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, add ALL variables from the [reference table below](#7-environment-variables-reference).

### 6.3 Enable Scheduled Functions

The cron job is configured in `netlify.toml`. After deployment, verify:
1. Go to **Functions** in Netlify Dashboard
2. Confirm `auto-poster` appears as a scheduled function
3. Check that it shows the correct schedule: `0 6 * * *` (daily at 06:00 UTC = 10:00 AM Tbilisi)

### 6.4 Custom Domain (Optional)

1. In Netlify: **Domain settings** → **Add custom domain**
2. E.g., `social.axelnetwork.org`
3. Update the LinkedIn OAuth redirect URL if using a custom domain

---

## 7. Environment Variables Reference

```bash
# ── Authentication ──
ADMIN_PASSWORD=                    # Dashboard login password (choose a strong one)
SESSION_SECRET=                    # 32+ character random string for cookie encryption
                                   # Generate with: openssl rand -hex 32

# ── Cron Security ──
CRON_SECRET=                       # Random string to protect the cron endpoint
                                   # Generate with: openssl rand -hex 16

# ── Meta (Facebook + Instagram) ──
META_PAGE_ID=                      # Facebook Page ID (numeric)
META_PAGE_TOKEN=                   # Long-lived Page Access Token (never expires)
META_IG_ACCOUNT_ID=                # Instagram Business Account ID (numeric)

# ── LinkedIn ──
LINKEDIN_CLIENT_ID=                # LinkedIn App Client ID
LINKEDIN_CLIENT_SECRET=            # LinkedIn App Client Secret
LINKEDIN_ORG_ID=                   # LinkedIn Company Page Organization ID (numeric)

# ── AI Content Generation ──
ANTHROPIC_API_KEY=                 # Claude API key from console.anthropic.com

# ── Media Storage ──
CLOUDINARY_CLOUD_NAME=             # Cloudinary cloud name
CLOUDINARY_API_KEY=                # Cloudinary API key
CLOUDINARY_API_SECRET=             # Cloudinary API secret

# ── Optional ──
TIMEZONE=Asia/Tbilisi              # IANA timezone (defaults to Asia/Tbilisi)
CAMPAIGN_LINK=https://axelnetwork.org  # Default link in captions
```

---

## 8. Testing Checklist

After deployment, verify everything works:

### Auth
- [ ] Go to `/dashboard` → you should see a login screen
- [ ] Enter admin password → you should see the dashboard
- [ ] Close browser and reopen → session should persist

### Post Management
- [ ] Create a new post with Georgian + English copy
- [ ] Edit the post, change the date
- [ ] Approve the post
- [ ] Unapprove the post (revert to draft)

### Asset Upload
- [ ] Upload a PNG image → verify it appears in Asset Studio
- [ ] Upload a short video → verify it appears
- [ ] Click an asset thumbnail → lightbox should open
- [ ] Create a post and pick an asset from the picker

### Manual Publishing (Test One Platform at a Time)
- [ ] Create a test post, approve it
- [ ] Click "Post Now" for Facebook → verify post appears on Axel's FB page
- [ ] Click "Post Now" for Instagram → verify post appears on IG
- [ ] Click "Post Now" for LinkedIn → verify post appears on LI

### Cron
- [ ] Wait for next cron run (or trigger manually via Netlify Functions dashboard)
- [ ] Verify that approved posts with today's date get published
- [ ] Verify that draft (unapproved) posts are NOT published

### AI Generation
- [ ] Go to Generate page
- [ ] Select "Academy" pillar, set a date range, click Generate
- [ ] Verify draft posts appear with Georgian + English content
- [ ] Click "Add to Calendar" → verify posts appear in calendar

### LinkedIn OAuth
- [ ] Go to Settings → click "Connect LinkedIn"
- [ ] Complete OAuth flow → verify "Connected" status appears

---

## 9. Brand Voice Approval

Before enabling AI content generation, Axel's team should review and approve the brand voice configuration. See [BRAND-VOICE.md](BRAND-VOICE.md) for:

1. A questionnaire the Axel team needs to fill out
2. The proposed brand voice rules
3. Sample AI-generated content for approval

The brand voice file (`lib/brand-voice.ts`) controls how the AI generates content. It should be reviewed and approved by Axel's Managing Director or marketing lead before going live.
