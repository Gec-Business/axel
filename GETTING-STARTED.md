# Getting Started — For Axel Team

This guide tells you exactly what to do with Claude Code Max to set up the social media auto-poster.

## Prerequisites
- Access to Axel Network's Facebook Page (admin)
- Access to Axel Network's Instagram Business Account (admin)
- Access to Axel Network's LinkedIn Company Page (admin)
- Claude Code Max subscription

## Step-by-Step Setup

### Step 1: Clone and Open
```bash
git clone https://github.com/Gec-Business/axel.git
cd axel
```
Open this folder in Claude Code Max.

### Step 2: Fill Out Brand Voice
> **Tell Claude:** *"Open BRAND-VOICE.md and help me fill out the questionnaire. Our organization is Axel Network (axelnetwork.org), a Georgian angel investor network. Walk me through each question."*

### Step 3: Set Up Supabase (Database)
> **Tell Claude:** *"Read GUIDE.md section 2. Walk me through creating a Supabase project and running all the SQL to create the database tables."*

### Step 4: Set Up Meta App (Facebook + Instagram)
> **Tell Claude:** *"Read GUIDE.md section 3. Walk me through creating a Meta app for Axel Network's Facebook page and Instagram account. I need the Page ID, Page Token, and Instagram Account ID."*

This is the longest step (15-30 min). Claude guides you through the Meta developer portal.

### Step 5: Set Up LinkedIn
> **Tell Claude:** *"Read GUIDE.md section 4. Help me create a LinkedIn app and connect Axel Network's company page."*

### Step 6: Set Up Cloudinary + Claude API
> **Tell Claude:** *"Read GUIDE.md sections 5 and 6. Help me create Cloudinary and Anthropic API accounts and get the keys."*

### Step 7: Deploy to Netlify
> **Tell Claude:** *"Read GUIDE.md section 7. Deploy this project to Netlify and set all environment variables. Here are my keys: [paste your keys]."*

### Step 8: Add GitHub Actions (Auto-Posting Cron)
> **Tell Claude:** *"Create the GitHub Actions workflow files for daily auto-posting at 10 AM Tbilisi time and daily database backups. The content is described in ARCHITECTURE.md backup and cron sections. Also help me set up the GitHub repository secrets (SITE_URL, CRON_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY)."*

### Step 9: Test Everything
> **Tell Claude:** *"Read GUIDE.md section 10 (Testing Checklist). Walk me through testing: login to dashboard, create a test post, upload an image, approve the post, and manually publish to Facebook."*

### Step 10: Start Creating Content
> **Tell Claude:** *"Go to the Generate page. Generate a week of Academy content for Axel Network starting next Monday. Review the drafts and help me edit them before approving."*

---

## Ongoing Operations

| What You Want | Tell Claude |
|--------------|-------------|
| New campaign | *"Create a campaign for Academy Batch 4 selling period, May 1-15. Generate 3 posts per week for it."* |
| Upload visuals | *"Upload these designer files to the Asset Studio and assign them to this week's posts."* |
| Review AI content | *"Show me all draft posts. Edit the Georgian copy on post X and approve the rest."* |
| Check performance | *"Show me analytics for last week's posts. Which post got the most engagement?"* |
| Fix LinkedIn | *"LinkedIn posting failed. Check the token health and help me reconnect."* |
| New team member access | *"Change the dashboard password and share it with the new team member."* |
| Meta app review | *"Help me prepare the screen recordings and description for Meta app review submission."* |

## Troubleshooting

| Problem | Tell Claude |
|---------|-------------|
| Can't log in | *"I'm locked out of the dashboard. Check if rate limiting is active and help me reset it."* |
| Post failed | *"Post X failed to publish to Instagram. Check the error and help me fix it."* |
| Cron didn't run | *"The auto-poster didn't run today. Check GitHub Actions logs and help me trigger it manually."* |
| LinkedIn expired | *"LinkedIn shows 'Not connected' in settings. Help me re-authorize."* |
| Meta token invalid | *"Facebook posting stopped working. Help me generate a new Page Access Token."* |

## Key Files Reference

| File | What It Does |
|------|-------------|
| GUIDE.md | Complete setup instructions for all services |
| ARCHITECTURE.md | System design, data models, API reference |
| BRAND-VOICE.md | AI content generation questionnaire + rules |
| COSTS.md | Monthly cost breakdown ($5-15/mo) |
| CLAUDE.md | Quick reference for Claude Code |
| .env.example | All required environment variables |
