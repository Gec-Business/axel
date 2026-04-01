export const SITE_CONFIG = {
  name: 'Axel Network',
  url:
    process.env.URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000',
  timezone: process.env.TIMEZONE || 'Asia/Tbilisi',
  primaryLanguageLabel: 'ქართული',
  secondaryLanguageLabel: 'English',
  campaignLink:
    process.env.CAMPAIGN_LINK || 'https://axelnetwork.org',
  utm: {
    source: 'social',
    medium: 'organic',
    campaignPrefix: 'axel',
  },
};
