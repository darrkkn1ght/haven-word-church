import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  url, 
  type = 'website',
  author = 'Haven Word Church',
  publishedTime,
  modifiedTime,
  section = 'Church',
  tags = []
}) => {
  const siteName = 'Haven Word Church';
  const siteUrl = process.env.REACT_APP_FRONTEND_URL || 'https://havenwordchurch.org';
  const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
  const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/logo.jpeg`;

  const metaTags = [
    // Basic SEO
    { name: 'description', content: description },
    { name: 'keywords', content: [...keywords, 'church', 'faith', 'christian', 'nigeria', 'lagos'].join(', ') },
    { name: 'author', content: author },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'English' },
    { name: 'revisit-after', content: '7 days' },

    // Open Graph
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: fullImage },
    { property: 'og:url', content: fullUrl },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'en_US' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: fullImage },
    { name: 'twitter:site', content: '@havenwordchurch' },
    { name: 'twitter:creator', content: '@havenwordchurch' },

    // Additional Open Graph for articles
    ...(type === 'article' ? [
      { property: 'article:author', content: author },
      { property: 'article:section', content: section },
      ...(publishedTime ? [{ property: 'article:published_time', content: publishedTime }] : []),
      ...(modifiedTime ? [{ property: 'article:modified_time', content: modifiedTime }] : []),
      ...(tags.map(tag => ({ property: 'article:tag', content: tag })))
    ] : []),

    // Church-specific meta tags
    { name: 'church:name', content: siteName },
    { name: 'church:location', content: 'Lagos, Nigeria' },
    { name: 'church:denomination', content: 'Christian' },
    { name: 'church:service-times', content: 'Sundays at 9:00 AM and 11:00 AM' }
  ];

  const linkTags = [
    { rel: 'canonical', href: fullUrl },
    { rel: 'alternate', hreflang: 'en', href: fullUrl },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.jpeg`,
    description: description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lagos',
      addressCountry: 'Nigeria'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+234-XXX-XXXX-XXX',
      contactType: 'customer service'
    },
    sameAs: [
      'https://facebook.com/havenwordchurch',
      'https://twitter.com/havenwordchurch',
      'https://instagram.com/havenwordchurch'
    ]
  };

  if (type === 'article') {
    structuredData.headline = title;
    structuredData.author = {
      '@type': 'Person',
      name: author
    };
    if (publishedTime) {
      structuredData.datePublished = publishedTime;
    }
    if (modifiedTime) {
      structuredData.dateModified = modifiedTime;
    }
    if (image) {
      structuredData.image = fullImage;
    }
  }

  return (
    <Helmet>
      <title>{title}</title>
      
      {/* Meta tags */}
      {metaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
      
      {/* Link tags */}
      {linkTags.map((link, index) => (
        <link key={index} {...link} />
      ))}
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional meta tags for better SEO */}
      <meta name="theme-color" content="#1976d2" />
      <meta name="msapplication-TileColor" content="#1976d2" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://res.cloudinary.com" />
    </Helmet>
  );
};

export default SEOHead;