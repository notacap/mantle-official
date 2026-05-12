const SITE_URL = 'https://www.mantle-clothing.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/cart',
          '/checkout',
          '/order-confirmation',
        ],
      },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'GoogleOther', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'Meta-ExternalAgent', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      { userAgent: 'Diffbot', allow: '/' },
      { userAgent: 'DuckAssistBot', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
