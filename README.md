# Axel Network — Social Media Auto-Poster

A social media management system built for [Axel Network](https://axelnetwork.org) — Georgia's angel investor network.

## What This System Does

- **Auto-posts** to Facebook, Instagram, and LinkedIn on scheduled dates
- **Bilingual content** — Georgian first, then English in every post
- **AI-generated content** — Claude API creates copy and hashtags based on Axel's brand voice
- **Asset Studio** — designer uploads visuals, team picks them for posts
- **Campaign management** — create time-bound campaigns (e.g., "Academy Batch 3")
- **Approval workflow** — AI generates drafts, team reviews/edits, approves, cron auto-posts
- **Dashboard** — web interface for managing everything

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL, free tier) |
| Binary Assets | Netlify Blobs |
| Large Videos | Cloudinary (free tier) |
| AI Content | Claude API (Anthropic) |
| Auth | iron-session (single admin password) |
| Hosting | Netlify |
| Cron | GitHub Actions (external, free) |
| Backups | GitHub Actions → Git-committed JSON exports |

## Documentation

| Document | Description |
|----------|-------------|
| [GETTING-STARTED.md](GETTING-STARTED.md) | **Start here** -- Prompts for Axel team using Claude Code Max |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, data models, project structure, API design |
| [GUIDE.md](GUIDE.md) | Detailed setup: Supabase, Meta, LinkedIn, Cloudinary, Netlify |
| [BRAND-VOICE.md](BRAND-VOICE.md) | Brand voice questionnaire + AI content guidelines |
| [COSTS.md](COSTS.md) | Monthly cost analysis ($5-15/mo) |

## Quick Start

1. Read [GUIDE.md](GUIDE.md) and complete all setup steps
2. Clone this repo and install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in credentials
4. Run locally: `npm run dev`
5. Deploy to Netlify: connect this repo in Netlify dashboard

## Content Pillars

| Pillar | Description | Example Posts |
|--------|-------------|---------------|
| Academy | Angel Investor Academy batches (Georgian + Central Asia) | Enrollment announcements, testimonials, curriculum highlights |
| Members | Spotlight angel investors | Member profiles, why they joined, what they look for |
| Events | Quarterly events | Event announcements, recaps, speaker highlights |
| Portfolio | Invested startups | Startup achievements, founder stories, traction updates |
| General | Ecosystem thought leadership | Market insights, angel investing education |

## Project Status

This repository contains the **architecture and setup documentation**. Implementation follows 8 phases — see [ARCHITECTURE.md](ARCHITECTURE.md) for details.
