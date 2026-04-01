export const AXEL_BRAND_VOICE = {
  name: 'Axel Network',
  tagline: 'Empowering Georgia\'s Digital Future',
  website: 'https://axelnetwork.org',

  tone: [
    'professional yet approachable',
    'community-driven',
    'innovation-focused',
    'inclusive and encouraging',
    'confident without being arrogant',
  ],

  audienceSegments: [
    'aspiring developers and designers in Georgia',
    'tech professionals looking to upskill',
    'startups and entrepreneurs in the Caucasus region',
    'international partners and collaborators',
    'university students exploring tech careers',
  ],

  languages: {
    ka: {
      code: 'ka',
      name: 'Georgian',
      nativeName: 'ქართული',
      notes:
        'Primary language. Always lead with Georgian copy. Use natural, modern Georgian — avoid overly formal or bureaucratic phrasing.',
    },
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      notes:
        'Secondary language for international reach. Keep it concise and clear. Follow Georgian copy separated by a divider.',
    },
  },

  pillarGuidelines: {
    academy:
      'Highlight learning outcomes, mentor expertise, and student success stories. Use encouraging language that makes tech education feel accessible.',
    members:
      'Celebrate community achievements. Spotlight individual members and their journeys. Foster a sense of belonging.',
    events:
      'Create excitement and urgency. Include clear date, time, location, and registration info. Use action-oriented language.',
    portfolio:
      'Showcase completed work with pride. Focus on impact and results. Credit team members and partners.',
    general:
      'Reinforce brand values and mission. Share industry insights relevant to the Georgian tech ecosystem.',
  },

  hashtagSets: {
    core: [
      '#AxelNetwork',
      '#AxelGeorgia',
      '#TechGeorgia',
      '#DigitalGeorgia',
    ],
    academy: [
      '#AxelAcademy',
      '#LearnToCode',
      '#TechEducation',
      '#GeorgianTech',
    ],
    members: [
      '#AxelCommunity',
      '#MemberSpotlight',
      '#TechCommunity',
    ],
    events: [
      '#AxelEvents',
      '#TechMeetup',
      '#TbilisiTech',
    ],
    portfolio: [
      '#AxelPortfolio',
      '#MadeByAxel',
      '#CaseStudy',
    ],
    ecosystem: [
      '#StartupGeorgia',
      '#CaucasusTech',
      '#InnovationHub',
    ],
  },

  doNot: [
    'Use slang or overly casual language that undermines professionalism',
    'Make promises about specific job placements or salary outcomes',
    'Use political or divisive language',
    'Post content without both Georgian and English versions',
    'Use stock-photo aesthetics — prefer authentic community imagery',
    'Overuse emojis — keep them purposeful and minimal',
    'Publish without proofreading both language versions',
  ],
} as const;
