import type { MetadataRoute } from 'next'



export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://ablmathew.github.io/Abelmathew-/sitemap.xml',
  }
}
