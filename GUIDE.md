# Setup Guide — Axel Social Media Auto-Poster (v2)

This guide walks through every step needed to connect this system to Axel Network's social media accounts and deploy it.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Setup (Database)](#2-supabase-setup-database)
3. [Facebook & Instagram Setup (Meta)](#3-facebook--instagram-setup-meta)
4. [LinkedIn Setup](#4-linkedin-setup)
5. [Cloudinary Setup (Video Storage)](#5-cloudinary-setup-video-storage)
6. [Claude API Setup (AI Content)](#6-claude-api-setup-ai-content)
7. [Netlify Deployment](#7-netlify-deployment)
8. [GitHub Actions Setup (Cron + Backups)](#8-github-actions-setup-cron--backups)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Testing Checklist](#10-testing-checklist)
11. [Brand Voice Approval](#11-brand-voice-approval)

---

## 1. Prerequisites

Before starting, make sure you have:

- [ ] Admin access to Axel Network's **Facebook Page**
- [ ] Admin access to Axel Network's **Instagram Business Account** (connected to the Facebook Page)
- [ ] Admin access to Axel Network's **LinkedIn Company Page**
- [ ] A **Netlify account** (free tier — see [COSTS.md](COSTS.md))
- [ ] A **Supabase account** (free tier — [supabase.com](https://supabase.com/))
- [ ] A **GitHub account** with access to this repository
- [ ] Node.js 18+ installed locally (for development)

---

## 2. Supabase Setup (Database)

Supabase provides the PostgreSQL database for posts, campaigns, settings, and audit logs.

### 2.1 Create a Project

1. Go to [supabase.com](https://supabase.com/) → Sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `axel-social-poster`
   - **Database password:** Generate a strong password and save it
   - **Region:** Choose the closest to Georgia (e.g., `eu-central-1` Frankfurt)
4. Wait for the project to provision (~2 minutes)

### 2.2 Get Connection Details

From the Supabase Dashboard → **Settings** → **API**:
- **Project URL** → save as `SUPABASE_URL`
- **anon/public key** → save as `SUPABASE_ANON_KEY`
- **service_role key** → save as `SUPABASE_SERVICE_KEY` (keep this secret!)

### 2.3 Create Database Tables

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  content_type TEXT NOT NULL DEFAULT 'image_post',
  pillar TEXT NOT NULL DEFAULT 'general',
  topic TEXT NOT NULL DEFAULT '',
  goal TEXT NOT NULL DEFAULT '',
  copy_ka TEXT NOT NULL DEFAULT '',
  copy_en TEXT NOT NULL DEFAULT '',
  hashtags TEXT[] DEFAULT '{}',
  utm_link TEXT,
  notes TEXT,
  -- Per-platform copy overrides
  copy_ka_facebook TEXT,
  copy_en_facebook TEXT,
  copy_ka_instagram TEXT,
  copy_en_instagram TEXT,
  copy_ka_linkedin TEXT,
  copy_en_linkedin TEXT,
  hashtags_facebook TEXT[],
  hashtags_instagram TEXT[],
  hashtags_linkedin TEXT[],
  -- Assets
  asset_ids TEXT[] DEFAULT '{}',
  -- Workflow
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  publish_results JSONB DEFAULT '{}',
  -- Associations
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  ai_generated BOOLEAN DEFAULT FALSE
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  name_ka TEXT,
  description TEXT,
  pillar TEXT NOT NULL DEFAULT 'general',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning'
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'
);

-- Settings (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets metadata (binary files stored in Netlify Blobs)
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  storage_type TEXT NOT NULL DEFAULT 'blob',
  blob_key TEXT,
  cloudinary_url TEXT,
  thumbnail_url TEXT,
  public_url TEXT
);

-- LinkedIn tokens (stored in DB instead of Blobs for reliability)
CREATE TABLE linkedin_tokens (
  id TEXT PRIMARY KEY DEFAULT 'current',
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  refresh_expires_at BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_created ON assets(created_at DESC);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_date ON posts(scheduled_date);
CREATE INDEX idx_posts_campaign_id ON posts(campaign_id);
CREATE INDEX idx_posts_pillar ON posts(pillar);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2.4 Enable Row Level Security (RLS)

For the free tier with server-side access only (using service_role key), RLS can be kept simple:

```sql
-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (our API routes use this key)
CREATE POLICY "Service role full access" ON posts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON campaigns FOR ALL USING (true);
CREATE POLICY "Service role full access" ON audit_log FOR ALL USING (true);
CREATE POLICY "Service role full access" ON settings FOR ALL USING (true);
CREATE POLICY "Service role full access" ON assets FOR ALL USING (true);
CREATE POLICY "Service role full access" ON linkedin_tokens FOR ALL USING (true);
```

---

## 3. Facebook & Instagram Setup (Meta)

### 3.1 Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Log in with an account that has admin access to Axel's Facebook Page
3. Click **"My Apps"** → **"Create App"**
4. Select **"Business"** type
5. Name it: `Axel Social Poster`
6. Select Axel's Business Manager if available

### 3.2 Add Required Products

In the App Dashboard, add these products:
- **Facebook Login for Business**
- **Instagram Graph API** (under "Add Products")

### 3.3 Get Facebook Page ID

1. Go to your Facebook Page
2. Click **About** → scroll to **Page ID** (numeric string)
3. Or use Graph API Explorer: `GET /me/accounts` → find the page → copy `id`
4. Save this as `META_PAGE_ID`

### 3.4 Get a Long-Lived Page Access Token

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

### 3.5 Get Instagram Business Account ID

```
GET https://graph.facebook.com/v25.0/META_PAGE_ID?fields=instagram_business_account&access_token=META_PAGE_TOKEN
```

The response contains `instagram_business_account.id`. Save this as `META_IG_ACCOUNT_ID`.

### 3.6 Required Permissions Summary

| Permission | Why |
|-----------|-----|
| `pages_manage_posts` | Post to Facebook Page |
| `instagram_content_publish` | Post to Instagram |
| `instagram_basic` | Read Instagram account info |
| `pages_read_engagement` | Check post status |
| `business_management` | Business account access |

### 3.7 App Review (for Production)

For production use, Meta requires app review for these permissions. Submit your app for review with:
- A description of the auto-posting use case
- Screen recordings showing how the dashboard creates and publishes posts
- Privacy policy URL (can be on axelnetwork.org)

**Timeline:** Meta review typically takes 1-5 business days.

---

## 4. LinkedIn Setup

### 4.1 Create a LinkedIn App

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers/)
2. Click **"Create app"**
3. Fill in:
   - **App name:** `Axel Social Poster`
   - **LinkedIn Page:** Select Axel Network's company page
   - **App logo:** Upload Axel's logo
4. Save the app

### 4.2 Get Credentials

From the app's **Auth** tab:
- Copy **Client ID** → save as `LINKEDIN_CLIENT_ID`
- Copy **Client Secret** → save as `LINKEDIN_CLIENT_SECRET`

### 4.3 Request Required Products

In the **Products** tab, request access to:
- **Community Management API** (for posting to the company page — replaces deprecated Share on LinkedIn)
- **Sign In with LinkedIn using OpenID Connect** (for OAuth)

Request Community Management API access (Development or Standard tier). The old `w_organization_social` scope was deprecated in June 2023. These are usually auto-approved for verified company pages.

### 4.4 Configure OAuth Redirect

In the **Auth** tab → **OAuth 2.0 settings**:
- Add redirect URL: `https://YOUR-NETLIFY-SITE.netlify.app/api/linkedin/callback`
- For local development, also add: `http://localhost:3000/api/linkedin/callback`

### 4.5 Get Organization ID

1. Go to Axel Network's LinkedIn Company Page
2. Click **Admin tools** → look at the URL
3. The URL contains the organization ID (numeric): `linkedin.com/company/ORGANIZATION_ID/`
4. Save as `LINKEDIN_ORG_ID`

### 4.6 Connect LinkedIn from Dashboard

After deployment:
1. Go to `/dashboard/settings`
2. Click **"Connect LinkedIn"**
3. Authorize the app → tokens are stored automatically
4. Tokens auto-refresh — no manual renewal needed

---

## 5. Cloudinary Setup (Video Storage)

Cloudinary is used for storing large video files (>10MB) since Netlify Blobs has size limits.

### 5.1 Create Account

1. Go to [cloudinary.com](https://cloudinary.com/) → Sign up (free tier)
2. Free tier includes: **25GB storage**, **25GB bandwidth/month**

### 5.2 Get Credentials

From the Cloudinary Dashboard:
- **Cloud name** → save as `CLOUDINARY_CLOUD_NAME`
- **API Key** → save as `CLOUDINARY_API_KEY`
- **API Secret** → save as `CLOUDINARY_API_SECRET`

### 5.3 Create Upload Preset (Optional)

For unsigned uploads from the dashboard:
1. Go to **Settings** → **Upload**
2. Create an **unsigned upload preset** named `axel-assets`

---

## 6. Claude API Setup (AI Content)

The system uses Claude API to generate bilingual content (Georgian + English).

### 6.1 Get API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account or sign in
3. Go to **API Keys** → **Create Key**
4. Save as `ANTHROPIC_API_KEY`

### 6.2 Billing

- Claude API uses pay-per-use pricing
- Estimated cost: $5-15/month for Axel's volume (see [COSTS.md](COSTS.md))
- Set a monthly spending limit in the Anthropic console

---

## 7. Netlify Deployment

### 7.1 Connect Repository

1. Log in to [netlify.com](https://netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select this GitHub repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** `netlify/functions`

### 7.2 Set Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, add ALL variables from the [reference table below](#7-environment-variables-reference).

### 7.3 Verify Deployment

After deployment:
1. Visit your Netlify site URL → should redirect to `/dashboard`
2. Verify login works with your `ADMIN_PASSWORD`
3. Check **Functions** tab in Netlify Dashboard → API routes should appear

### 7.4 Custom Domain (Optional)

1. In Netlify: **Domain settings** → **Add custom domain**
2. E.g., `social.axelnetwork.org`
3. Update the LinkedIn OAuth redirect URL if using a custom domain

---

## 8. GitHub Actions Setup (Cron + Backups)

Since Netlify Scheduled Functions have a 30-second timeout (too short for multi-platform posting with media), we use GitHub Actions as an external cron trigger.

### 8.1 Add Repository Secrets

Go to this repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Value |
|-------------|-------|
| `SITE_URL` | Your Netlify site URL (e.g., `https://axel-social.netlify.app`) |
| `CRON_SECRET` | Same value as your `CRON_SECRET` env var |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key (for backup exports) |

### 8.2 Cron Workflow

The file `.github/workflows/auto-post.yml` runs daily at 06:00 UTC (10:00 AM Tbilisi):

```yaml
name: Auto-Post
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:  # Manual trigger button

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger auto-post
        run: |
          curl -X POST "${{ secrets.SITE_URL }}/api/cron/auto-post" \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            --fail --max-time 600
```

### 8.3 Backup Workflow

The file `.github/workflows/backup.yml` exports Supabase data daily:

```yaml
name: Daily Backup
on:
  schedule:
    - cron: '0 3 * * *'  # 03:00 UTC (before posting)

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Export data
        run: |
          mkdir -p backups
          curl "${{ secrets.SUPABASE_URL }}/rest/v1/posts?select=*" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" > backups/posts.json
          curl "${{ secrets.SUPABASE_URL }}/rest/v1/campaigns?select=*" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" > backups/campaigns.json
      - name: Commit
        run: |
          git config user.name "Backup Bot"
          git config user.email "noreply@axelnetwork.org"
          git add backups/
          git commit -m "Backup $(date +%Y-%m-%d)" || true
          git push
```

### 8.4 Verify Cron

1. Go to repo → **Actions** tab
2. Click **Auto-Post** workflow → **Run workflow** (manual trigger)
3. Verify it calls your Netlify endpoint successfully
4. Wait for the next scheduled run (06:00 UTC) and check logs

---

## 9. Environment Variables Reference

```bash
# ── Authentication ──
ADMIN_PASSWORD=                    # Dashboard login password
SESSION_SECRET=                    # 32+ chars: openssl rand -hex 32

# ── Cron Security ──
CRON_SECRET=                       # Random string: openssl rand -hex 16

# ── Supabase (Database) ──
SUPABASE_URL=                      # Supabase project URL
SUPABASE_ANON_KEY=                 # Supabase anon/public key
SUPABASE_SERVICE_KEY=              # Supabase service_role key (keep secret!)

# ── Meta (Facebook + Instagram) ──
META_PAGE_ID=                      # Facebook Page ID (numeric)
META_PAGE_TOKEN=                   # Long-lived Page Access Token
META_IG_ACCOUNT_ID=                # Instagram Business Account ID

# ── LinkedIn ──
LINKEDIN_CLIENT_ID=                # LinkedIn App Client ID
LINKEDIN_CLIENT_SECRET=            # LinkedIn App Client Secret
LINKEDIN_ORG_ID=                   # LinkedIn Company Organization ID

# ── AI Content Generation ──
ANTHROPIC_API_KEY=                 # Claude API key

# ── Media Storage ──
CLOUDINARY_CLOUD_NAME=             # Cloudinary cloud name
CLOUDINARY_API_KEY=                # Cloudinary API key
CLOUDINARY_API_SECRET=             # Cloudinary API secret

# ── Optional ──
TIMEZONE=Asia/Tbilisi              # IANA timezone
CAMPAIGN_LINK=https://axelnetwork.org
```

---

## 10. Testing Checklist

After deployment, verify everything works:

### Auth
- [ ] Go to `/dashboard` → login screen appears
- [ ] Enter admin password → dashboard loads
- [ ] Session persists across browser restart

### Supabase Connection
- [ ] Create a post → verify it appears in Supabase Dashboard → Table Editor → posts
- [ ] Edit the post → verify `updated_at` auto-updates
- [ ] Delete the post → verify it's removed

### Post Management
- [ ] Create post with Georgian + English copy
- [ ] Create post with per-platform copy overrides
- [ ] Approve the post → status changes to "approved"
- [ ] Unapprove → reverts to "draft"

### Asset Upload
- [ ] Upload a PNG image → verify auto-conversion to JPEG
- [ ] Upload a short video → verify it appears
- [ ] Upload a file >10 MB → verify it goes to Cloudinary
- [ ] Reject upload of unsupported file type (e.g., .exe, .svg)

### Manual Publishing (Test One Platform at a Time)
- [ ] Create a test post, approve it
- [ ] Click "Post Now" for Facebook → verify post appears on Axel's FB page
- [ ] Click "Post Now" for Instagram → verify post appears on IG
- [ ] Click "Post Now" for LinkedIn → verify post appears on LI

### Cron (GitHub Actions)
- [ ] Go to repo → Actions → Auto-Post → Run workflow (manual trigger)
- [ ] Verify that approved posts with today's date get published
- [ ] Verify that draft (unapproved) posts are NOT published
- [ ] Verify post status changes: approved → publishing → posted

### AI Generation
- [ ] Go to Generate page
- [ ] Select "Academy" pillar, set a date range, click Generate
- [ ] Verify draft posts appear with Georgian + English content
- [ ] Click "Add to Calendar" → verify posts appear in calendar

### LinkedIn OAuth
- [ ] Go to Settings → click "Connect LinkedIn"
- [ ] Complete OAuth flow → verify "Connected" status appears

---

## 11. Brand Voice Approval

Before enabling AI content generation, Axel's team should review and approve the brand voice configuration. See [BRAND-VOICE.md](BRAND-VOICE.md) for:

1. A questionnaire the Axel team needs to fill out
2. The proposed brand voice rules
3. Sample AI-generated content for approval

The brand voice file (`lib/brand-voice.ts`) controls how the AI generates content. It should be reviewed and approved by Axel's Managing Director or marketing lead before going live.
