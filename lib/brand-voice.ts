export const AXEL_BRAND_VOICE = {
  name: 'Axel Network',
  tagline: 'Georgian Angel Investor Network',
  website: 'https://axelnetwork.org',

  tone: [
    'Professional but approachable',
    'Knowledgeable about startup ecosystems and angel investing',
    'Encouraging and empowering toward founders and new investors',
    'Community-oriented — emphasize the network, not individual ego',
    'Forward-looking — Georgia as an emerging innovation hub',
  ],

  audienceSegments: {
    angelInvestors: 'Experienced business people in Georgia considering angel investing',
    startupFounders: 'Georgian startup founders seeking investment and mentorship',
    academyParticipants: 'People interested in learning angel investing (Georgian + Central Asian markets)',
    generalEcosystem: 'Startup ecosystem stakeholders in Georgia and Central Asia',
  },

  languages: {
    ka: {
      code: 'ka',
      name: 'Georgian',
      nativeName: 'ქართული',
      notes:
        'Primary language. Always lead with Georgian copy. Use formal but warm Georgian. Avoid overly academic language. Startup/business English loanwords are normal in Georgian startup community.',
    },
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      notes:
        'Secondary language for international reach. Professional English. For LinkedIn focus on industry credibility. For Facebook/Instagram be slightly more casual.',
    },
  },

  pillarGuidelines: {
    academy:
      'Highlight learning outcomes, instructor credibility, practical value, cohort community. Use urgency for enrollment periods. Mention both Georgian batch and Central Asia online batch.',
    members:
      'Spotlight individual angel investors — their background, why they joined, what they look for in startups. Personal storytelling to attract new members.',
    events:
      'Build excitement, share key takeaways, highlight speakers/panelists. Post-event: share photos, quotes, metrics. Quarterly events.',
    portfolio:
      'Celebrate startup achievements, share traction metrics, tell founder stories. Position Axel as a value-adding investor.',
    general:
      'Ecosystem thought leadership, market insights, angel investing education, Georgian startup scene news.',
  },

  hashtagSets: {
    core: ['#AxelNetwork', '#AngelInvesting', '#GeorgianStartups'],
    academy: ['#AngelInvestorAcademy', '#InvestorEducation', '#LearnToInvest'],
    members: ['#AngelInvestor', '#SmartMoney', '#InvestorSpotlight'],
    events: ['#StartupEvent', '#InvestorMeetup', '#TbilisiStartups'],
    portfolio: ['#PortfolioUpdate', '#StartupGrowth', '#MadeInGeorgia'],
    ecosystem: ['#TechGeorgia', '#EmergingMarkets', '#StartupEcosystem'],
  },

  doNot: [
    'Never promise investment returns or financial guarantees',
    'Never disparage other investor networks or accelerators',
    'Never share confidential deal information or financials',
    'Avoid overly salesy or pushy language — lead with value',
    'Avoid AI-generic phrases ("In today\'s fast-paced world...", "Exciting news!")',
    'Never post without both Georgian and English versions',
    'Avoid overusing emojis — keep them purposeful and minimal',
  ],
} as const;
