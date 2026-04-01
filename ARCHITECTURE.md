# Architecture — Axel Social Media Auto-Poster

## Overview

A social media CMS that lets Axel Network's team create, schedule, approve, and auto-publish bilingual content (Georgian + English) to Facebook, Instagram, and LinkedIn. Includes AI content generation, asset management, and campaign planning.

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                   AXEL DASHBOARD                      │
│  (Next.js App Router — React 19 + Tailwind CSS 4)    │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  Today   │ │ Calendar │ │ Campaigns│ │ Assets  │ │
│  │  View    │ │  View    │ │  View    │ │ Studio  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       │             │            │             │      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ AI Gen   │ │ Post     │ │ Settings │            │
│  │ Panel    │ │ Editor   │ │          │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
└───────┼─────────────┼────────────┼──────────────────┘
        │             │            │
        ▼             ▼            ▼
┌──────────────────────────────────────────────────────┐
│                   API ROUTES                          │
│  /api/posts      /api/campaigns    /api/assets       │
│  /api/ai         /api/cron         /api/auth         │
│  /api/linkedin   /api/settings                       │
└───────┬─────────────┬────────────┬──────────────────┘
        │             │            │
        ▼             ▼            ▼
┌───────────────┐ ┌───────────┐ ┌──────────────────┐
│ Netlify Blobs │ │ Claude    │ │ Social APIs      │
│ (Storage)     │ │ API (AI)  │ │ Meta Graph v25   │
│               │ │           │ │ LinkedIn Mktg    │
└───────────────┘ └───────────┘ └──────────────────┘
        │
        ▼
┌───────────────┐
│ Cloudinary    │
│ (Large video) │
└───────────────┘
```

---

## Data Models

### Post

Every social media post in the system.

```typescript
type Platform = 'facebook' | 'instagram' | 'linkedin';

type ContentType = 'carousel' | 'reel' | 'story' | 'image_post' | 'text_post' | 'video' | 'poll';

type PostStatus = 'draft' | 'approved' | 'posted' | 'failed';

type ContentPillar = 'academy' | 'members' | 'events' | 'portfolio' | 'general';

interface Post {
  id: string;
  createdAt: string;              // ISO datetime
  updatedAt: string;              // ISO datetime

  // Scheduling — posts go out on whatever dates the team picks (not necessarily daily)
  scheduledDate: string;          // ISO date e.g. '2026-04-15'
  scheduledTime?: string;         // Optional: 'HH:mm' — defaults to cron time (10:00 AM Tbilisi)
  platforms: Platform[];          // Which platforms to post to
  contentType: ContentType;

  // Content
  pillar: ContentPillar;
  topic: string;                  // Short title / subject
  goal: string;                   // 'Awareness' | 'Conversion' | 'Engagement' etc.
  copyKa: string;                 // Georgian caption
  copyEn: string;                 // English caption
  hashtags: string[];
  utmLink?: string;
  notes?: string;                 // Internal notes (not published)

  // Assets
  assetIds: string[];             // References to Asset.id in the asset store

  // Workflow
  status: PostStatus;
  approvedAt?: string;            // When the team approved this post

  // Publishing results (filled after posting)
  publishResults?: Record<Platform, {
    posted: boolean;
    postedAt: string;
    postId?: string;              // Platform's post ID
    error?: string;
    autoPosted: boolean;          // true = cron posted, false = manual "Post Now"
  }>;

  // Associations
  campaignId?: string;            // Optional link to a Campaign

  // AI metadata
  aiGenerated?: boolean;          // true if AI created this draft
}
```

### Campaign

Groups posts around a theme and time window (e.g., "Academy Batch 3 Selling Campaign").

```typescript
interface Campaign {
  id: string;
  createdAt: string;
  updatedAt: string;

  name: string;                   // e.g. "Academy Batch 3 — Enrollment Push"
  nameKa?: string;                // Georgian name
  description?: string;
  pillar: ContentPillar;

  startDate: string;              // ISO date
  endDate: string;                // ISO date

  status: 'planning' | 'active' | 'completed' | 'archived';
}
```

### Asset

An uploaded image or video available for use in posts.

```typescript
interface Asset {
  id: string;
  createdAt: string;

  name: string;                   // Filename or user-set name
  category: ContentPillar | 'brand' | 'template';
  tags: string[];                 // Free-form tags for filtering
  mimeType: string;               // 'image/png', 'video/mp4', etc.
  sizeBytes: number;

  // Storage
  storageType: 'blob' | 'cloudinary';
  blobKey?: string;               // Netlify Blob key (images <10MB)
  cloudinaryUrl?: string;         // Cloudinary URL (large videos)

  // Resolved URL for social APIs (must be publicly accessible)
  publicUrl: string;
}
```

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
│   ├── blob-stores.ts            # CRUD for posts, campaigns, assets via Netlify Blobs
│   ├── ai-generator.ts           # Claude API content generation
│   ├── brand-voice.ts            # Axel tone, audience, pillar guidelines, hashtag sets
│   └── utils.ts                  # Date helpers, ID generation, caption builder
│
├── app/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect to /dashboard
│   ├── globals.css               # Tailwind + base styles
│   │
│   ├── api/
│   │   ├── auth/route.ts                     # POST login, DELETE logout
│   │   ├── posts/route.ts                    # GET list (with filters), POST create
│   │   ├── posts/[id]/route.ts               # GET single, PUT update, DELETE
│   │   ├── posts/[id]/approve/route.ts       # POST approve, DELETE unapprove
│   │   ├── posts/batch-approve/route.ts      # POST approve multiple posts at once
│   │   ├── posts/publish-now/route.ts        # POST manually publish a post to a platform
│   │   ├── campaigns/route.ts                # GET list, POST create
│   │   ├── campaigns/[id]/route.ts           # GET single, PUT update, DELETE
│   │   ├── assets/route.ts                   # GET list, POST upload (multipart)
│   │   ├── assets/[id]/route.ts              # GET metadata, DELETE
│   │   ├── assets/[id]/file/route.ts         # GET serve binary file (public, no auth)
│   │   ├── ai/generate/route.ts              # POST generate batch of draft posts
│   │   ├── cron/auto-post/route.ts           # POST cron endpoint (x-cron-secret header)
│   │   ├── linkedin/route.ts                 # LinkedIn OAuth start
│   │   ├── linkedin/callback/route.ts        # LinkedIn OAuth callback
│   │   └── settings/route.ts                 # GET/PUT app settings
│   │
│   └── dashboard/
│       ├── layout.tsx                        # Sidebar + TopBar wrapper
│       ├── page.tsx                          # Today view — pending approvals, today's posts
│       ├── calendar/page.tsx                 # Month/week calendar view
│       ├── campaigns/page.tsx                # Campaign list
│       ├── campaigns/[id]/page.tsx           # Campaign detail + associated posts
│       ├── posts/new/page.tsx                # Create new post form
│       ├── posts/[id]/edit/page.tsx          # Edit post form
│       ├── assets/page.tsx                   # Asset Studio — upload + gallery
│       ├── generate/page.tsx                 # AI content generation interface
│       └── settings/page.tsx                 # Platform connections, cron config
│
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx                       # Navigation sidebar
│   │   ├── TopBar.tsx                        # Page title + quick stats
│   │   ├── PostCard.tsx                      # Post display with bilingual tabs + actions
│   │   ├── PostForm.tsx                      # Create/edit form
│   │   ├── BilingualEditor.tsx               # Georgian/English tab textarea editor
│   │   ├── CalendarGrid.tsx                  # Month calendar view
│   │   ├── CalendarWeekView.tsx              # Week calendar view
│   │   ├── AssetUploader.tsx                 # Drag-and-drop upload component
│   │   ├── AssetGallery.tsx                  # Filterable asset grid
│   │   ├── AssetPicker.tsx                   # Modal to select assets for a post
│   │   ├── AssetLightbox.tsx                 # Full-screen media viewer
│   │   ├── CampaignCard.tsx                  # Campaign summary card
│   │   ├── ApprovalStatusBadge.tsx           # Draft/Approved/Posted status badge
│   │   ├── ContentPillarBadge.tsx            # Content pillar indicator
│   │   ├── BatchApprovalBar.tsx              # Floating bar for batch approve
│   │   ├── PlatformBadge.tsx                 # Facebook/Instagram/LinkedIn badge
│   │   ├── CopyButton.tsx                    # Copy to clipboard button
│   │   └── MetricCard.tsx                    # Statistics display card
│   └── ui/
│       ├── Modal.tsx
│       ├── ConfirmDialog.tsx
│       ├── Toast.tsx
│       ├── LoadingSpinner.tsx
│       ├── DatePicker.tsx
│       └── Select.tsx
│
├── netlify/
│   └── functions/
│       └── auto-poster.ts                   # Scheduled function — runs daily at 06:00 UTC
│
├── middleware.ts                              # Auth guard for /dashboard routes
├── package.json
├── netlify.toml                              # Build config + scheduled function config
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .env.example
└── CLAUDE.md                                 # AI assistant reference
```

---

## API Routes

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth` | No | Login with admin password |
| DELETE | `/api/auth` | Yes | Logout |
| GET | `/api/posts` | Yes | List posts. Filters: `status`, `pillar`, `campaignId`, `dateFrom`, `dateTo`, `platform` |
| POST | `/api/posts` | Yes | Create post (defaults to "draft" status) |
| GET | `/api/posts/[id]` | Yes | Get single post |
| PUT | `/api/posts/[id]` | Yes | Update post |
| DELETE | `/api/posts/[id]` | Yes | Delete post (draft/failed only) |
| POST | `/api/posts/[id]/approve` | Yes | Approve post for auto-posting |
| DELETE | `/api/posts/[id]/approve` | Yes | Unapprove (revert to draft) |
| POST | `/api/posts/batch-approve` | Yes | Approve multiple posts: `{ ids: string[] }` |
| POST | `/api/posts/publish-now` | Yes | Manual publish: `{ id: string, platform: Platform }` |
| GET | `/api/campaigns` | Yes | List campaigns. Filters: `status`, `pillar` |
| POST | `/api/campaigns` | Yes | Create campaign |
| GET | `/api/campaigns/[id]` | Yes | Get campaign + stats |
| PUT | `/api/campaigns/[id]` | Yes | Update campaign |
| DELETE | `/api/campaigns/[id]` | Yes | Delete campaign (disassociates posts) |
| GET | `/api/assets` | Yes | List assets. Filters: `category`, `tag`, `mimeType` |
| POST | `/api/assets` | Yes | Upload asset (multipart/form-data) |
| GET | `/api/assets/[id]` | Yes | Get asset metadata |
| DELETE | `/api/assets/[id]` | Yes | Delete asset + binary |
| GET | `/api/assets/[id]/file` | **No** | Serve binary file (must be public for social APIs) |
| POST | `/api/ai/generate` | Yes | Generate batch of draft posts |
| POST | `/api/cron/auto-post` | Cron | Auto-post approved posts (x-cron-secret header) |
| GET | `/api/linkedin` | Yes | Start LinkedIn OAuth flow |
| GET | `/api/linkedin/callback` | No | OAuth callback |
| GET | `/api/settings` | Yes | Get app settings |
| PUT | `/api/settings` | Yes | Update settings |

---

## Cron / Auto-Posting Logic

The cron runs **daily at 06:00 UTC (10:00 AM Tbilisi time)** as a check. Posts are NOT daily — the team schedules posts on whatever dates they choose.

**Flow:**
1. Netlify scheduled function fires → calls `POST /api/cron/auto-post` with cron secret
2. API route loads all posts where `status === 'approved'` AND `scheduledDate <= today`
3. For each qualifying post, for each platform:
   - Skip if already posted on that platform
   - Resolve assets (look up `assetIds` → get `publicUrl`)
   - Build bilingual caption (Georgian first, then English, then hashtags)
   - Call publishing engine → post to Facebook / Instagram / LinkedIn
   - Record result in `publishResults`
4. When all platforms for a post are done → set `status = 'posted'`

**Caption format published to all platforms:**
```
[Georgian copy]

---

[English copy]

#hashtag1 #hashtag2 #hashtag3
```

---

## Storage Strategy

**Netlify Blobs** is used for all persistent data:

| Store | Key | Content |
|-------|-----|---------|
| `axel-posts` | `index` | JSON array of all Post objects |
| `axel-campaigns` | `index` | JSON array of all Campaign objects |
| `axel-assets-index` | `index` | JSON array of all Asset metadata |
| `axel-asset-files` | `asset-{id}` | Binary file content (images <10MB) |
| `linkedin-auth` | `tokens` | LinkedIn OAuth tokens + refresh |
| `axel-settings` | `config` | App settings JSON |

**Cloudinary** is used for large video files (>10MB). Free tier provides 25GB storage, 25GB bandwidth/month.

---

## Dashboard Pages

### Today View (`/dashboard`)
- 4 metric cards: Pending Approval, Posting Today, Overdue, Active Campaigns
- "Needs Approval" section — draft posts with batch-select checkboxes
- "Posting Today" section — approved posts for today
- "Overdue" section — approved posts past their date, not yet posted
- "Coming Up" section — next 7 days of scheduled content

### Calendar (`/dashboard/calendar`)
- Toggle: Month / Week view
- Color-coded dots per content pillar
- Click date to see posts or create new post
- Filters: pillar, platform, status

### Campaigns (`/dashboard/campaigns`)
- Campaign cards: name, dates, pillar, post count, progress
- Campaign detail: associated posts, progress metrics
- Create new campaign form

### Post Editor (`/dashboard/posts/new` and `/dashboard/posts/[id]/edit`)
- Date picker, platform selector, content type, pillar
- Bilingual editor (Georgian tab + English tab)
- Hashtag input
- Asset picker (opens Asset Studio modal)
- Campaign association dropdown
- Save as Draft / Save and Approve

### Asset Studio (`/dashboard/assets`)
- Drag-and-drop upload zone
- Filterable gallery grid (by category, tag, file type)
- Click to preview in lightbox
- Delete assets

### AI Generation (`/dashboard/generate`)
- Select: pillar, campaign, date range, posts per week, platforms
- Additional context text area
- "Generate" button → shows draft posts for review
- "Add to Calendar" / "Discard" per post
- "Add All" batch button

### Settings (`/dashboard/settings`)
- Platform connection status (Facebook, Instagram, LinkedIn)
- LinkedIn "Connect" button (OAuth flow)
- Environment variable status indicators

---

## Implementation Phases

| Phase | What | Depends On |
|-------|------|------------|
| **1. Core** | Project setup, auth, blob stores, post CRUD API, config | Nothing |
| **2. Calendar + Posts** | Dashboard UI, calendar views, post create/edit forms | Phase 1 |
| **3. Asset Studio** | Upload, gallery, asset picker, binary file serving | Phase 1 |
| **4. Publishing** | Adapt social-publisher.ts, cron, manual post-now | Phases 1-3 |
| **5. Campaigns** | Campaign CRUD, detail view, post association | Phases 1-2 |
| **6. AI Generation** | Claude API integration, generation UI, brand voice | Phases 1-2 |
| **7. Polish** | Settings page, error handling, toast notifications, mobile | Phases 1-6 |
| **8. Boosting** | Meta Marketing API integration (future) | Phase 4 |
