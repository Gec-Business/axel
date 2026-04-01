# Axel Network Social Auto-Poster

## Architecture
- Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- Database: Supabase (PostgreSQL) for posts, campaigns, settings, audit log
- Binary assets: Netlify Blobs
- Large videos: Cloudinary
- AI content: Claude API via @anthropic-ai/sdk
- Auth: iron-session (single admin password)
- Cron: GitHub Actions (daily at 06:00 UTC = 10:00 AM Tbilisi)
- Backups: GitHub Actions (daily at 03:00 UTC)

## Key Files
- lib/social-publisher.ts — Publishing engine (FB, IG, LinkedIn API calls)
- lib/supabase.ts — Database CRUD operations
- lib/ai-generator.ts — Claude API content generation with brand voice
- lib/utils.ts — Caption builder with per-platform copy + UTM tracking
- lib/constants.ts — All TypeScript types and interfaces
- lib/analytics.ts — Post-publish engagement metrics

## Data Flow
1. Content created (manually or AI-generated) → status: 'draft'
2. Team reviews, edits per-platform copy, assigns assets → approves
3. GitHub Actions cron fires daily → calls /api/cron/auto-post
4. Sets status to 'publishing' (atomic SQL) → publishes to platforms
5. Updates status to 'posted' or 'failed' with publish_results

## Post Status Flow
draft → approved → publishing → posted
                              → failed

## Bilingual Caption Format
Georgian copy first, then "---" separator, then English copy, then hashtags.
Per-platform copy overrides are optional — if set, used instead of default.

## Conventions
- Database columns: snake_case
- TypeScript interfaces: snake_case (matching DB)
- React components: PascalCase
- API routes: Next.js App Router
- Dates: ISO format, timezone: Asia/Tbilisi
