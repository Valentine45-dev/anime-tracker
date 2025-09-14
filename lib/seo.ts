// SEO optimization utilities
import { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
}

const defaultSEO = {
  title: 'AniTracker - Track Your Anime Journey',
  description: 'Discover, track, and discuss your favorite anime series. Join clubs, share reviews, and connect with fellow anime enthusiasts.',
  keywords: ['anime', 'tracker', 'manga', 'otaku', 'community', 'reviews', 'watchlist'],
  image: '/og-image.png',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://anitracker.app',
  type: 'website' as const
}

export function generateMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const seo = { ...defaultSEO, ...config }
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords?.join(', '),
    
    // Open Graph
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      siteName: 'AniTracker',
      images: [
        {
          url: seo.image || defaultSEO.image,
          width: 1200,
          height: 630,
          alt: seo.title,
        }
      ],
      locale: 'en_US',
      type: seo.type,
      ...(seo.publishedTime && { publishedTime: seo.publishedTime }),
      ...(seo.modifiedTime && { modifiedTime: seo.modifiedTime }),
      ...(seo.author && { authors: [seo.author] }),
      ...(seo.section && { section: seo.section }),
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.image || defaultSEO.image],
      creator: '@anitracker',
      site: '@anitracker',
    },
    
    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    
    // Alternate languages
    alternates: {
      canonical: seo.url,
      languages: {
        'en-US': seo.url,
        'ja-JP': `${seo.url}/ja`,
      },
    },
    
    // App-specific
    applicationName: 'AniTracker',
    category: 'Entertainment',
    classification: 'Anime Tracking Application',
  }
}

// Specific SEO configurations for different pages
export const seoConfigs = {
  home: () => generateMetadata({
    title: 'AniTracker - Track Your Anime Journey',
    description: 'Discover, track, and discuss your favorite anime series. Join clubs, share reviews, and connect with fellow anime enthusiasts.',
    keywords: ['anime tracker', 'anime list', 'anime community', 'watchlist', 'anime reviews']
  }),
  
  discover: () => generateMetadata({
    title: 'Discover Anime - AniTracker',
    description: 'Explore trending anime, get personalized recommendations, and discover your next favorite series.',
    keywords: ['anime discovery', 'trending anime', 'anime recommendations', 'new anime']
  }),
  
  clubs: () => generateMetadata({
    title: 'Anime Clubs - AniTracker',
    description: 'Join anime discussion clubs, participate in conversations, and connect with fans who share your interests.',
    keywords: ['anime clubs', 'anime community', 'anime discussions', 'anime forums']
  }),
  
  profile: (username: string) => generateMetadata({
    title: `${username}'s Profile - AniTracker`,
    description: `View ${username}'s anime list, reviews, and activity on AniTracker.`,
    type: 'profile',
    keywords: ['anime profile', 'user profile', 'anime list', 'anime reviews']
  }),
  
  anime: (title: string, synopsis?: string) => generateMetadata({
    title: `${title} - AniTracker`,
    description: synopsis ? `${synopsis.slice(0, 155)}...` : `Information, reviews, and discussions about ${title}.`,
    type: 'article',
    keywords: ['anime', title.toLowerCase(), 'anime information', 'anime reviews']
  }),
  
  club: (clubName: string, description?: string) => generateMetadata({
    title: `${clubName} Club - AniTracker`,
    description: description ? `${description.slice(0, 155)}...` : `Join the ${clubName} club and discuss with fellow fans.`,
    keywords: ['anime club', clubName.toLowerCase(), 'anime community', 'discussions']
  }),
}

// JSON-LD structured data generators
export function generateAnimeStructuredData(anime: {
  title: string
  description?: string
  image?: string
  rating?: number
  genre?: string[]
  releaseDate?: string
  director?: string
  studio?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: anime.title,
    description: anime.description,
    image: anime.image,
    genre: anime.genre,
    datePublished: anime.releaseDate,
    director: anime.director ? {
      '@type': 'Person',
      name: anime.director
    } : undefined,
    productionCompany: anime.studio ? {
      '@type': 'Organization',
      name: anime.studio
    } : undefined,
    aggregateRating: anime.rating ? {
      '@type': 'AggregateRating',
      ratingValue: anime.rating,
      ratingCount: 1,
      bestRating: 10,
      worstRating: 1
    } : undefined,
  }
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AniTracker',
    url: defaultSEO.url,
    logo: `${defaultSEO.url}/logo.png`,
    description: defaultSEO.description,
    sameAs: [
      'https://twitter.com/anitracker',
      'https://facebook.com/anitracker',
      'https://instagram.com/anitracker'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@anitracker.app'
    }
  }
}

export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AniTracker',
    url: defaultSEO.url,
    description: defaultSEO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${defaultSEO.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

// Sitemap generation helper
export function generateSitemapUrls() {
  const baseUrl = defaultSEO.url
  const staticPages = [
    '',
    '/discover',
    '/clubs',
    '/auth/login',
    '/auth/signup'
  ]
  
  return staticPages.map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly' as const,
    priority: path === '' ? 1.0 : 0.8
  }))
}

// Robots.txt generation
export function generateRobotsTxt() {
  const baseUrl = defaultSEO.url
  
  return `User-agent: *
Allow: /

# Disallow admin and auth pages
Disallow: /admin
Disallow: /auth/

# Disallow API routes
Disallow: /api/

# Allow important pages
Allow: /
Allow: /discover
Allow: /clubs
Allow: /anime/
Allow: /profile/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1`
}

// Performance optimization helpers
export function preloadCriticalResources() {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'dns-prefetch', href: 'https://api.jikan.moe' },
    { rel: 'dns-prefetch', href: 'https://cdn.myanimelist.net' },
  ]
}

// Analytics and tracking
export function generateAnalyticsConfig() {
  return {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_ID,
    googleTagManager: process.env.NEXT_PUBLIC_GTM_ID,
    facebookPixel: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    hotjar: process.env.NEXT_PUBLIC_HOTJAR_ID,
  }
}
