# Architecture — Axel Social Media Auto-Poster (v2)

## Overview

A social media CMS that lets Axel Network's team create, schedule, approve, and auto-publish bilingual content (Georgian + English) to Facebook, Instagram, and LinkedIn. Includes AI content generation, asset management, campaign planning, per-platform copy customization, and post-publish analytics.

**v2 changes:** Supabase replaces Netlify Blobs for structured data. External cron replaces Netlify Scheduled Functions. Per-platform copy overrides. Post-publish analytics. Image processing pipeline. Hardened security.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      AXEL DASHBOARD                           │
│     (Next.js 16 App Router — React 19 + Tailwind CSS 4)      │
│                                                               │
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐│
│  │ Today  │ │ Calendar │ │Campaigns │ │ Assets │ │  AI    ││
│  │ View   │ │  View    │ │  View    │ │ Studio │ │ Gen    ││
│  └───┬────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘│
│      │           │            │            │          │      │
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │Analytics│ │ Post     │ │ Preview  │ │ Settings │         │
│  │  View   │ │ Editor   │ │ Mockups  │ │          │         │
│  └───┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
└──────┼───────────┼────────────┼─────────────┼───────────────┘
       │           │            │             │
       ▼           ▼            ▼             ▼
┌──────────────────────────────────────────────────────────────┐
│                        API ROUTES                             │
│  /api/posts  /api/campaigns  /api/assets  /api/ai            │
│  /api/cron   /api/auth       /api/linkedin /api/analytics    │
└──────┬───────────┬────────────┬─────────────┬───────────────┘
       │           │            │             │
       ▼           ▼            ▼             ▼
┌────────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐
│ Supabase   │ │ Netlify  │ │ Claude    │ │ Social APIs      │
│ (Postgres) │ │ Blobs    │ │ API (AI)  │ │ Meta Graph v25   │
│ Posts,     │ │ (Binary  │ │           │ │ LinkedIn Mktg    │
│ Campaigns, │ │  assets) │ │           │ │                  │
│ Settings   │ │          │ │           │ │                  │
└────────────┘ └──────────┘ └───────────┘ └──────────────────┘
                    │                            │
                    ▼                            ▼
              ┌───────────┐              ┌───────────────┐
              │Cloudinary │              │ GitHub Actions │
              │(Lg video) │              │ (External cron)│
              └───────────┘              └───────────────┘
```

### Why Supabase Instead of Netlify Blobs for Structured Data

| Problem with Blobs | How Supabase Fixes It |
|----|-----|
| Single JSON blob = race conditions on concurrent writes | PostgreSQL has ACID transactions, row-level locking |
| No backup/export mechanism | Built-in daily backups, point-in-time recovery |
| Eventual consistency (60s stale reads) | Strong consistency by default |
| Parsing entire JSON array on every read/write | SQL queries with indexes, filter at database level |
| No audit trail | Database triggers can log all changes |
| No relational queries | Foreign keys, JOINs for campaign → post associations |

**Netlify Blobs is still used** for binary asset files (images, videos <10MB) — it's excellent for that.

### Why External Cron Instead of Netlify Scheduled Functions

| Problem | Solution |
|---------|----------|
| Scheduled Functions have **30-second timeout** — too short for multi-platform posting with media | GitHub Actions workflow calls `/api/cron/auto-post` with no timeout constraint |
| Scheduled Functions are **Beta** with documented reliability issues (missed runs, timing drift) | GitHub Actions cron is battle-tested and free for public repos |
| No retry mechanism if function fails | GitHub Actions supports retry and failure notifications |

---

## Data Models

### Post

```typescript
type Platform = 'facebook' | 'instagram' | 'linkedin';

type ContentType = 'carousel' | 'reel' | 'story' | 'image_post' | 'text_post' | 'video';

// Note: 'publishing' status prevents race conditions — set BEFORE calling social APIs
type PostStatus = 'draft' | 'approved' | 'publishing' | 'posted' | 'failed';

type ContentPillar = 'academy' | 'members' | 'events' | 'portfolio' | 'general';

interface Post {
  id: string;
  created_at: string;             // ISO datetime (Supabase convention: snake_case)
  updated_at: string;

  // Scheduling
  scheduled_date: string;         // ISO date e.g. '2026-04-15'
  scheduled_time?: string;        // Optional: 'HH:mm' — defaults to cron time
  platforms: Platform[];
  content_type: ContentType;

  // Content (default — used when no per-platform override exists)
  pillar: ContentPillar;
  topic: string;
  goal: string;
  copy_ka: string;                // Georgian caption (default)
  copy_en: string;                // English caption (default)
  hashtags: string[];
  utm_link?: string;
  notes?: string;                 // Internal notes (not published)

  // Per-platform copy overrides (optional — if null, uses default copy_ka/copy_en)
  copy_ka_facebook?: string;
  copy_en_facebook?: string;
  copy_ka_instagram?: string;
  copy_en_instagram?: string;
  copy_ka_linkedin?: string;
  copy_en_linkedin?: string;
  hashtags_facebook?: string[];   // Platform-specific hashtags (optional)
  hashtags_instagram?: string[];
  hashtags_linkedin?: string[];

  // Assets
  asset_ids: string[];            // References to Asset.id

  // Workflow
  status: PostStatus;
  approved_at?: string;

  // Publishing results (per-platform, filled after posting)
  publish_results?: Record<Platform, {
    posted: boolean;
    posted_at: string;
    post_id?: string;             // Platform's post ID (used for analytics)
    error?: string;
    auto_posted: boolean;
  }>;

  // Associations
  campaign_id?: string;

  // AI metadata
  ai_generated?: boolean;
}
```

### Campaign

```typescript
interface Campaign {
  id: string;
  created_at: string;
  updated_at: string;

  name: string;                   // e.g. "Academy Batch 3 — Enrollment Push"
  name_ka?: string;
  description?: string;
  pillar: ContentPillar;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
}
```

### Asset

```typescript
interface Asset {
  id: string;
  created_at: string;

  name: string;
  category: ContentPillar | 'brand' | 'template';
  tags: string[];
  mime_type: string;              // 'image/jpeg', 'video/mp4', etc.
  size_bytes: number;
  width?: number;                 // Image/video dimensions (for validation)
  height?: number;

  // Storage
  storage_type: 'blob' | 'cloudinary';
  blob_key?: string;              // Netlify Blob key
  cloudinary_url?: string;
  thumbnail_url?: string;         // Auto-generated thumbnail for videos

  public_url: string;             // Resolved URL for social APIs
}
```

### Audit Log (new in v2)

```typescript
interface AuditEntry {
  id: string;
  created_at: string;
  action: 'post_created' | 'post_updated' | 'post_approved' | 'post_unapproved'
        | 'post_publishing' | 'post_published' | 'post_failed'
        | 'campaign_created' | 'campaign_updated'
        | 'asset_uploaded' | 'asset_deleted'
        | 'ai_generated' | 'login' | 'login_failed';
  entity_type: 'post' | 'campaign' | 'asset' | 'auth';
  entity_id?: string;
  details?: Record<string, unknown>;  // Platform, error message, etc.
}
```

---

## Platform-Specific Constraints

These are hard limits from the social APIs that affect the system design:

| Constraint | Value | Impact |
|-----------|-------|--------|
| Instagram carousel slides (API) | **Max 10** (not 20 — 20 is native app only) | Enforce in PostForm |
| Instagram image format | **JPEG only** (not PNG via API) | Auto-convert on upload with sharp |
| Instagram posts per day | 100 per 24h rolling window | Track in publish logic |
| Facebook posts per day | 25 per Page per 24h rolling window | Track in publish logic |
| LinkedIn soft limit | 3-5 posts/day before algorithmic penalty | Warn in dashboard |
| LinkedIn video max | 5 GB, 10 min duration | Validate on upload |
| LinkedIn image max | 5 MB (JPG, PNG, GIF) | Validate on upload |
| Instagram reel length | 5-90 seconds for Reels tab eligibility | Validate on upload |
| Meta Page Token | "Never expires" but can be invalidated | Health check endpoint |
| LinkedIn access token | Expires every 60 days (refresh: 365 days) | Expiry countdown in Settings |

---

## Project Structure

```
axel-social-poster/
├── lib/
│   ├── config.ts                 # Axel config (timezone: Asia/Tbilisi, languages, brand)
│   ├── constants.ts              # Types, enums, content pillars, platform info
│   ├── types.ts                  # SessionData interface
│   ├── auth.ts                   # iron-session authentication
│   ├── linkedin-tokens.ts        # LinkedIn OAuth token management + auto-refresh
│   ├── social-publisher.ts       # Publishing engine — FB, IG, LinkedIn API calls
│   ├── supabase.ts               # Supabase client + CRUD helpers for posts, campaigns, audit
│   ├── blob-stores.ts            # Netlify Blobs for binary assets only
│   ├── image-processor.ts        # sharp: JPEG conversion, dimension validation, thumbnails
│   ├── ai-generator.ts           # Claude API content generation
│   ├── brand-voice.ts            # Axel tone, audience, pillar guidelines, hashtag sets
│   ├── analytics.ts              # Fetch post metrics from Meta/LinkedIn APIs
│   └── utils.ts                  # Date helpers, ID generation, caption builder, UTM
│
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   │
│   ├── api/
│   │   ├── auth/route.ts                     # POST login, DELETE logout
│   │   ├── posts/route.ts                    # GET list (with filters), POST create
│   │   ├── posts/[id]/route.ts               # GET single, PUT update, DELETE
│   │   ├── posts/[id]/approve/route.ts       # POST approve, DELETE unapprove
│   │   ├── posts/[id]/analytics/route.ts     # GET engagement metrics from social APIs
│   │   ├── posts/batch-approve/route.ts      # POST approve multiple
│   │   ├── posts/publish-now/route.ts        # POST manual publish
│   │   ├── campaigns/route.ts                # GET list, POST create
│   │   ├── campaigns/[id]/route.ts           # GET, PUT, DELETE
│   │   ├── assets/route.ts                   # GET list, POST upload (multipart)
│   │   ├── assets/[id]/route.ts              # GET metadata, DELETE
│   │   ├── assets/[id]/file/route.ts         # GET serve binary (public, signed URL)
│   │   ├── ai/generate/route.ts              # POST generate batch (rate-limited: 10/day)
│   │   ├── cron/auto-post/route.ts           # POST cron endpoint (x-cron-secret)
│   │   ├── health/tokens/route.ts            # GET check Meta/LinkedIn token validity
│   │   ├── linkedin/route.ts                 # OAuth start
│   │   ├── linkedin/callback/route.ts        # OAuth callback
│   │   └── settings/route.ts                 # GET/PUT
│   │
│   └── dashboard/
│       ├── layout.tsx                        # Sidebar + TopBar
│       ├── page.tsx                          # Today view
│       ├── calendar/page.tsx                 # Month/week calendar
│       ├── campaigns/page.tsx                # Campaign list
│       ├── campaigns/[id]/page.tsx           # Campaign detail
│       ├── posts/new/page.tsx                # Create post (with per-platform editor)
│       ├── posts/[id]/edit/page.tsx          # Edit post
│       ├── posts/[id]/preview/page.tsx       # Platform preview mockups
│       ├── assets/page.tsx                   # Asset Studio
│       ├── analytics/page.tsx                # Post-publish analytics dashboard
│       ├── generate/page.tsx                 # AI content generation
│       └── settings/page.tsx                 # Platform connections + token health
│
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── PostCard.tsx                      # Post display with status + per-platform results
│   │   ├── PostForm.tsx                      # Create/edit with per-platform copy toggle
│   │   ├── BilingualEditor.tsx               # Georgian/English tab editor
│   │   ├── PlatformCopyEditor.tsx            # Per-platform copy overrides (NEW)
│   │   ├── PostPreview.tsx                   # Platform-specific post mockups (NEW)
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarWeekView.tsx
│   │   ├── AssetUploader.tsx                 # With file type/size validation
│   │   ├── AssetGallery.tsx
│   │   ├── AssetPicker.tsx
│   │   ├── AssetLightbox.tsx
│   │   ├── CampaignCard.tsx
│   │   ├── ApprovalStatusBadge.tsx           # Now includes 'publishing' status
│   │   ├── ContentPillarBadge.tsx
│   │   ├── BatchApprovalBar.tsx
│   │   ├── TokenHealthIndicator.tsx          # Shows token status + expiry warnings (NEW)
│   │   ├── AnalyticsCard.tsx                 # Post engagement metrics (NEW)
│   │   ├── PlatformBadge.tsx
│   │   ├── CopyButton.tsx
│   │   └── MetricCard.tsx
│   └── ui/
│       ├── Modal.tsx, ConfirmDialog.tsx, Toast.tsx, LoadingSpinner.tsx
│       └── DatePicker.tsx, Select.tsx
│
├── .github/
│   └── workflows/
│       ├── auto-post.yml                     # External cron: runs daily at 06:00 UTC
│       └── backup.yml                        # Daily backup: export Supabase data to repo
│
├── middleware.ts                              # Auth guard + login rate limiting
├── package.json
├── netlify.toml
├── tsconfig.json, next.config.ts, postcss.config.mjs
├── .env.example
└── CLAUDE.md
```

---

## API Routes

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth` | No | Login (rate-limited: 5 attempts/15 min) |
| DELETE | `/api/auth` | Yes | Logout |
| GET | `/api/posts` | Yes | List posts with SQL filters |
| POST | `/api/posts` | Yes | Create post (status: "draft") |
| GET | `/api/posts/[id]` | Yes | Get single post |
| PUT | `/api/posts/[id]` | Yes | Update post (blocked if status = "publishing") |
| DELETE | `/api/posts/[id]` | Yes | Delete post (draft/failed only) |
| POST | `/api/posts/[id]/approve` | Yes | Set status → "approved" |
| DELETE | `/api/posts/[id]/approve` | Yes | Revert → "draft" (blocked if "publishing") |
| GET | `/api/posts/[id]/analytics` | Yes | Fetch engagement from Meta/LinkedIn APIs |
| POST | `/api/posts/batch-approve` | Yes | Approve multiple: `{ ids: string[] }` |
| POST | `/api/posts/publish-now` | Yes | Manual publish (sets "publishing" → "posted"/"failed") |
| GET | `/api/campaigns` | Yes | List campaigns |
| POST | `/api/campaigns` | Yes | Create campaign |
| GET | `/api/campaigns/[id]` | Yes | Get campaign + post stats |
| PUT | `/api/campaigns/[id]` | Yes | Update campaign |
| DELETE | `/api/campaigns/[id]` | Yes | Delete (disassociates posts) |
| GET | `/api/assets` | Yes | List assets |
| POST | `/api/assets` | Yes | Upload (validates type/size, converts to JPEG for IG) |
| GET | `/api/assets/[id]` | Yes | Get metadata |
| DELETE | `/api/assets/[id]` | Yes | Delete asset + binary |
| GET | `/api/assets/[id]/file` | **Signed** | Serve binary (time-limited signed URL, public) |
| POST | `/api/ai/generate` | Yes | Generate drafts (rate-limited: 10/day) |
| POST | `/api/cron/auto-post` | Cron | Auto-post approved posts (x-cron-secret) |
| GET | `/api/health/tokens` | Yes | Check Meta/LinkedIn token validity + expiry |
| GET | `/api/linkedin` | Yes | Start OAuth flow |
| GET | `/api/linkedin/callback` | No | OAuth callback |
| GET | `/api/settings` | Yes | Get settings |
| PUT | `/api/settings` | Yes | Update settings |

---

## Cron / Auto-Posting Logic

### Trigger: GitHub Actions (external cron)

```yaml
# .github/workflows/auto-post.yml
name: Auto-Post
on:
  schedule:
    - cron: '0 6 * * *'    # Daily at 06:00 UTC (10:00 AM Tbilisi)
  workflow_dispatch:          # Manual trigger for testing

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

### Publishing Flow (race-condition safe)

```
1. Query Supabase: SELECT * FROM posts
   WHERE status = 'approved' AND scheduled_date <= TODAY

2. For each post:
   a. UPDATE status = 'publishing' WHERE status = 'approved' (atomic!)
      → If 0 rows affected: another process got it first, skip
      → If 1 row affected: we own this post now

   b. For each platform in post.platforms:
      → Resolve assets (blob URLs / Cloudinary URLs)
      → Build caption (per-platform copy if set, else default)
      → Call publishPost() → FB / IG / LinkedIn
      → Record result in publish_results JSONB column

   c. If all platforms succeeded:
      UPDATE status = 'posted'
   d. If any failed:
      UPDATE status = 'failed' (with error details)
      → Will NOT retry automatically — team reviews in dashboard

3. Log all results to audit_log table
```

**Why this is safe:** The `UPDATE ... WHERE status = 'approved'` is an atomic SQL operation. Even if two cron runs overlap, only one will successfully claim each post. No duplicate posts possible.

### Caption Builder

```
[Georgian copy — per-platform override or default]

---

[English copy — per-platform override or default]

[UTM-tagged link if configured]

#hashtag1 #hashtag2 #hashtag3
```

---

## Storage Strategy (v2)

### Supabase (structured data)

| Table | Purpose |
|-------|---------|
| `posts` | All post data including per-platform copy, status, publish results |
| `campaigns` | Campaign metadata |
| `settings` | App configuration (key-value) |
| `audit_log` | All actions with timestamps |
| `linkedin_tokens` | OAuth tokens (encrypted column) |

**Free tier:** 500 MB database, 50,000 rows, 2 GB bandwidth, 1 GB file storage. More than enough for Axel's volume.

### Netlify Blobs (binary assets only)

| Store | Key Pattern | Content |
|-------|-------------|---------|
| `axel-assets` | `asset-{uuid}` | Binary image/video file |
| `axel-assets` | `thumb-{uuid}` | Auto-generated thumbnail |

### Cloudinary (large videos >10MB)

Free tier: 10 GB storage, 20 GB bandwidth. Used only for videos too large for Netlify Blobs.

---

## Security Measures (v2)

| Measure | Implementation |
|---------|---------------|
| Login rate limiting | 5 attempts per IP per 15 minutes (counter in Supabase) |
| File upload validation | Magic byte checking (not just extension), allowlist: JPEG, PNG, GIF, MP4, MOV, WebM |
| File size limits | Images: 10 MB max. Videos: 100 MB max (larger → Cloudinary) |
| Asset URL signing | Time-limited signed URLs (1 hour expiry) instead of permanent public paths |
| Image auto-conversion | PNG → JPEG via sharp on upload (Instagram API requires JPEG) |
| Dimension validation | Warn if image doesn't match platform specs (IG: 1:1, 4:5, 1.91:1) |
| AI rate limiting | Max 10 generation requests per day (counter in Supabase) |
| Audit trail | All create/update/delete/publish actions logged to audit_log table |
| Token health checks | Daily automated check of Meta/LinkedIn token validity |
| Publishing lock | `status = 'publishing'` prevents concurrent publish of same post |
| `noindex` on assets | `X-Robots-Tag: noindex` + `Cache-Control: private` on asset endpoints |

---

## Dashboard Pages

### Today View (`/dashboard`)
- 4 metric cards: Pending Approval, Posting Today, Overdue, Active Campaigns
- Token health warnings (if Meta/LinkedIn tokens expiring soon)
- "Needs Approval" section with batch-select
- "Posting Today" section
- "Overdue" section (approved but past scheduled date)
- "Coming Up" (next 7 days)

### Calendar (`/dashboard/calendar`)
- Month / Week toggle
- Color-coded dots per content pillar
- Click date → see posts or create new
- Filters: pillar, platform, status

### Post Editor (`/dashboard/posts/new` and `[id]/edit`)
- Date picker, platform multi-select, content type, pillar
- **Default bilingual editor** (Georgian tab + English tab)
- **"Customize per platform" toggle** → expands to show FB/IG/LI-specific copy editors
- Hashtag input (with per-platform overrides option)
- Asset picker modal
- Campaign dropdown
- **Preview button** → opens platform mockup view
- Save as Draft / Save and Approve

### Post Preview (`/dashboard/posts/[id]/preview`)
- Side-by-side mockups: Facebook card, Instagram post, LinkedIn post
- Shows actual caption, image, hashtags as they'll appear
- Platform-specific copy highlighted if different from default

### Asset Studio (`/dashboard/assets`)
- Drag-and-drop upload with real-time validation (type, size, dimensions)
- Warnings for non-JPEG images ("Will be auto-converted for Instagram")
- Filterable gallery
- Dimension info displayed per asset

### Analytics (`/dashboard/analytics`) — Phase 7
- Post-publish engagement: likes, comments, shares, reach per post
- Cross-platform comparison
- Campaign performance summary
- Best-performing content pillar insights

### Settings (`/dashboard/settings`)
- Platform connection status with **health indicators** (green/yellow/red)
- LinkedIn token expiry countdown
- Meta token validation status
- "Connect LinkedIn" button
- UTM configuration (source, medium, campaign prefix)

---

## Implementation Phases (Revised)

| Phase | What | Key Changes from v1 |
|-------|------|---------------------|
| **1. Core** | Project setup, Supabase schema, auth, post CRUD API, config | Supabase instead of Blobs for data |
| **2. Calendar + Posts** | Dashboard, calendar views, post forms with per-platform editor | Per-platform copy editor is new |
| **3. Asset Studio** | Upload with validation, JPEG conversion, gallery, picker | Image processing pipeline is new |
| **4. Publishing** | Adapt publisher, GitHub Actions cron, manual post-now | External cron + `publishing` lock status |
| **5. Campaigns** | Campaign CRUD, detail view, post association | Same as v1 |
| **6. AI Generation** | Claude API, generation UI, brand voice, rate limiting | AI rate limiting is new |
| **7. Analytics + Polish** | Post analytics, token health, settings, error handling, mobile | Analytics dashboard is new |
| **8. Boosting** | Meta Marketing API (future) | Same as v1 |

---

## Backup Strategy (v2)

### Automated Daily Backup via GitHub Actions

```yaml
# .github/workflows/backup.yml
name: Daily Backup
on:
  schedule:
    - cron: '0 3 * * *'    # 03:00 UTC daily (before posting cron)

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Export Supabase data
        run: |
          # Export posts, campaigns, settings, audit_log as JSON
          curl "$SUPABASE_URL/rest/v1/posts?select=*" \
            -H "apikey: $SUPABASE_ANON_KEY" > backups/posts.json
          curl "$SUPABASE_URL/rest/v1/campaigns?select=*" \
            -H "apikey: $SUPABASE_ANON_KEY" > backups/campaigns.json
          # ... etc
      - name: Commit backup
        run: |
          git add backups/
          git commit -m "Daily backup $(date +%Y-%m-%d)" || true
          git push
```

This creates a Git history of all data — any state can be recovered from any point in time.
