# Brand Voice — Axel Network

This document defines how the AI generates social media content for Axel Network. **The Axel team must review and approve this before AI content generation goes live.**

---

## Part 1: Questionnaire for Axel Team

Please answer these questions so we can calibrate the AI to match Axel's voice. Fill in your answers directly in this file or provide them separately.

### General Brand Identity

1. **How would you describe Axel Network's personality in 3-5 words?**
   - _Example: "Professional, empowering, forward-thinking, community-driven"_
   - Your answer: ___

2. **What tone should social media posts have?**
   - [ ] Formal and professional
   - [ ] Professional but friendly
   - [ ] Casual and approachable
   - [ ] Mix (depends on the platform/topic)
   - Notes: ___

3. **Are there specific words or phrases Axel uses frequently?** (catchphrases, taglines, mottos)
   - Your answer: ___

4. **Are there words or phrases the AI should NEVER use?**
   - _Example: "guaranteed returns", "risk-free investment"_
   - Your answer: ___

5. **Should the AI use emojis in posts?**
   - [ ] Yes, frequently
   - [ ] Sparingly (1-3 per post)
   - [ ] Never
   - Notes: ___

### Georgian Language Specifics

6. **What register of Georgian should the AI use?**
   - [ ] Formal (თქვენი)
   - [ ] Informal (შენი)
   - [ ] Mix depending on context
   - Notes: ___

7. **Should English business/startup terms be used in Georgian text?** (e.g., "სტარტაპი", "ინვესტორი", "პიჩი")
   - [ ] Yes, use commonly adopted English loanwords
   - [ ] Prefer pure Georgian equivalents where possible
   - Notes: ___

8. **Are there Georgian-specific cultural references or phrases Axel likes to use?**
   - Your answer: ___

### Content Pillars

9. **Academy posts — what's the main selling point?**
   - _Example: "Practical skills from real investors, not theory"_
   - Georgian batch: ___
   - Central Asia batch: ___

10. **Member posts — how should members be described?**
    - _Example: "Experienced business leaders who believe in Georgian startups"_
    - Your answer: ___

11. **Event posts — what feeling should they create?**
    - [ ] FOMO / urgency ("Don't miss this!")
    - [ ] Professional networking value
    - [ ] Community celebration
    - [ ] Mix
    - Notes: ___

12. **Portfolio posts — how should startups be highlighted?**
    - [ ] Focus on traction/metrics ("raised $X, grew Y%")
    - [ ] Focus on founder stories
    - [ ] Focus on innovation/problem being solved
    - [ ] Mix
    - Notes: ___

### Audience & Goals

13. **Who is the PRIMARY target audience for each platform?**
    - Facebook: ___
    - Instagram: ___
    - LinkedIn: ___

14. **What is the #1 goal of Axel's social media presence?**
    - [ ] Attract new angel investors to join the network
    - [ ] Attract startups to pitch to Axel
    - [ ] Build brand awareness for the Georgian startup ecosystem
    - [ ] Promote Academy enrollment
    - [ ] All of the above (rank by priority): ___

15. **Are there competitors or peers whose social media style Axel admires?**
    - Your answer: ___

### Visual & Formatting

16. **Does Axel have a brand guide (colors, fonts, logo usage)?** If yes, please share it.
    - Your answer: ___

17. **Preferred hashtag strategy:**
    - [ ] Consistent set of branded hashtags on every post
    - [ ] Mix of branded + topic-specific hashtags
    - [ ] Minimal hashtags
    - Must-use hashtags: ___

18. **Should every post include a call-to-action?**
    - [ ] Yes, always (e.g., "Join us", "Apply now", "Learn more")
    - [ ] Only for sales/enrollment posts
    - [ ] Rarely
    - Notes: ___

### Existing Content Review

19. **Please share links to 5-10 posts you consider "ideal" for Axel's brand:**
    - Facebook: ___
    - Instagram: ___
    - LinkedIn: ___

20. **Are there any past posts that were wrong in tone or messaging?** (so we know what to avoid)
    - Your answer: ___

---

## Part 2: Proposed Brand Voice Rules (Draft)

_These rules will be updated after the Axel team answers the questionnaire above._

### Tone

| Attribute | Description |
|-----------|-------------|
| Professional | Knowledgeable about startup ecosystems and angel investing |
| Empowering | Encouraging toward founders and new investors |
| Community-first | Emphasize the network, not individual ego |
| Forward-looking | Georgia as an emerging innovation hub |
| Warm but credible | Not corporate-stiff, not too casual |

### Content Guidelines

**DO:**
- Lead with value (insight, learning, opportunity) — not sales
- Highlight real achievements with specific numbers
- Tell human stories (founder journeys, investor motivations)
- Reference Georgia's growing tech ecosystem positively
- Use bilingual format: Georgian first, then English

**DON'T:**
- Promise investment returns or financial guarantees
- Disparage other networks, accelerators, or competitors
- Share confidential deal information or financials
- Use overly salesy or pushy language
- Use AI-generic phrases ("In today's fast-paced world...", "Exciting news!")

### Hashtag Sets (Draft)

| Category | Hashtags |
|----------|----------|
| Core (every post) | `#AxelNetwork` `#AngelInvesting` `#GeorgianStartups` |
| Academy | `#AngelAcademy` `#InvestorEducation` `#LearnToInvest` |
| Members | `#AngelInvestor` `#SmartMoney` `#InvestorSpotlight` |
| Events | `#StartupEvent` `#TbilisiStartups` `#InvestorMeetup` |
| Portfolio | `#PortfolioUpdate` `#StartupGrowth` `#MadeInGeorgia` |
| Ecosystem | `#TechGeorgia` `#EmergingMarkets` `#StartupEcosystem` |

### Caption Structure Template

```
[Hook line — grab attention, in Georgian]

[Main content — 2-4 sentences, in Georgian]

[Call to action if applicable, in Georgian]

---

[Hook line — in English]

[Main content — 2-4 sentences, in English]

[Call to action if applicable, in English]

#hashtags
```

---

## Part 3: Approval Process

1. Axel team fills out the questionnaire (Part 1)
2. We update the brand voice rules based on answers
3. AI generates 5-10 sample posts across all pillars
4. Axel team reviews samples:
   - **Approved** — brand voice is ready, AI generation can go live
   - **Needs changes** — we adjust rules and generate new samples
5. Brand voice file (`lib/brand-voice.ts`) is updated and deployed

### Who Should Approve

| Role | Responsibility |
|------|---------------|
| Managing Director (Iro) | Final approval on tone and messaging |
| Project Manager (Tekla) | Review practical accuracy of Academy content |
| Marketing/BD (Ana) | Verify audience targeting and partnership messaging |

---

## Part 4: Social Media Accounts to Scrape

To calibrate the AI against Axel's existing content, we need the public URLs of:

- [ ] **Facebook Page:** ___
- [ ] **Instagram Account:** ___
- [ ] **LinkedIn Company Page:** ___

We will analyze the last 30-50 posts from each platform to extract:
- Common vocabulary and phrasing patterns
- Georgian language style and register
- Post structure and formatting habits
- Hashtag usage patterns
- Engagement patterns (which posts performed best)

This analysis will be shared with the Axel team for verification before being encoded into the AI system.
