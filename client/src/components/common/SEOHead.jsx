import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEOHead Component - Comprehensive SEO optimization for Haven Word Church
 * 
 * Handles dynamic meta tags, Open Graph, Twitter Cards, structured data,
 * and Nigerian church-specific SEO optimization
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (will be suffixed with church name)
 * @param {string} props.description - Page description for meta tags
 * @param {string} props.keywords - Additional keywords for the page
 * @param {string} props.image - Featured image URL for social sharing
 * @param {string} props.url - Canonical URL for the page
 * @param {string} props.type - Open Graph type (website, article, event, etc.)
 * @param {Object} props.article - Article-specific metadata
 * @param {Object} props.event - Event-specific metadata
 * @param {boolean} props.noIndex - Whether to add noindex meta tag
 * @param {Array} props.breadcrumbs - Breadcrumb data for structured data
 * @param {Object} props.organization - Override organization data
 */
const SEOHead = ({
  title = '',
  description = '',
  keywords = '',
  image = '',
  url = '',
  type = 'website',
  article = {},
  event = {},
  noIndex = false,
  breadcrumbs = [],
  organization = {}
}) => {
  // Default church information
  const defaultOrg = {
    name: 'Haven Word Church',
    description: 'A Christ-centered church in Ibadan, Nigeria, dedicated to spreading God\'s word and building a community of faith.',
    url: process.env.REACT_APP_SITE_URL || 'https://havenwordchurch.ng',
    logo: `${process.env.REACT_APP_SITE_URL || 'https://havenwordchurch.ng'}/logo-512.png`,
    address: {
      streetAddress: 'Ring Road',
      addressLocality: 'Ibadan',
      addressRegion: 'Oyo State',
      postalCode: '200001',
      addressCountry: 'NG'
    },
    telephone: '+234-803-123-4567',
    email: 'hello@havenwordchurch.ng',
    foundingDate: '2015',
    serviceTime: ['Sunday 8:00 AM', 'Sunday 10:30 AM', 'Wednesday 6:00 PM'],
    socialMedia: {
      facebook: 'https://facebook.com/havenwordchurch',
      instagram: 'https://instagram.com/havenwordchurch',
      youtube: 'https://youtube.com/@havenwordchurch',
      twitter: 'https://twitter.com/havenwordchurch'
    }
  };

  const orgData = { ...defaultOrg, ...organization };

  // Build full title
  const fullTitle = title 
    ? `${title} | ${orgData.name}` 
    : `${orgData.name} - ${orgData.description}`;

  // Build full description
  const fullDescription = description || orgData.description;

  // Build keywords
  const defaultKeywords = 'church, Ibadan, Nigeria, Christian, worship, sermons, ministry, faith, community, Bible study, prayer, gospel';
  const fullKeywords = keywords 
    ? `${keywords}, ${defaultKeywords}` 
    : defaultKeywords;

  // Build canonical URL
  const canonicalUrl = url || orgData.url;

  // Build image URL
  const featuredImage = image || orgData.logo;

  // Generate structured data for organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: orgData.name,
    description: orgData.description,
    url: orgData.url,
    logo: orgData.logo,
    image: orgData.logo,
    telephone: orgData.telephone,
    email: orgData.email,
    foundingDate: orgData.foundingDate,
    address: {
      '@type': 'PostalAddress',
      ...orgData.address
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '7.3775',
      longitude: '3.9470'
    },
    sameAs: Object.values(orgData.socialMedia),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Church Services',
      itemListElement: orgData.serviceTime.map((time, index) => ({
        '@type': 'Offer',
        name: `Worship Service - ${time}`,
        category: 'Religious Service'
      }))
    }
  };

  // Generate article structured data
  const articleSchema = article.title ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || fullDescription,
    image: article.image || featuredImage,
    author: {
      '@type': 'Person',
      name: article.author || 'Haven Word Church'
    },
    publisher: {
      '@type': 'Organization',
      name: orgData.name,
      logo: {
        '@type': 'ImageObject',
        url: orgData.logo
      }
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  } : null;

  // Generate event structured data
  const eventSchema = event.name ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description || fullDescription,
    image: event.image || featuredImage,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: orgData.name,
      address: {
        '@type': 'PostalAddress',
        ...orgData.address
      }
    },
    organizer: {
      '@type': 'Organization',
      name: orgData.name,
      url: orgData.url
    },
    offers: event.isFree ? {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock'
    } : undefined
  } : null;

  // Generate breadcrumb structured data
  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  } : null;

  // Combine all schemas
  const structuredData = [
    organizationSchema,
    articleSchema,
    eventSchema,
    breadcrumbSchema
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots Meta */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={featuredImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={orgData.name} />
      <meta property="og:locale" content="en_NG" />
      
      {/* Article-specific Open Graph tags */}
      {article.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article.author && (
        <meta property="article:author" content={article.author} />
      )}
      {article.section && (
        <meta property="article:section" content={article.section} />
      )}
      {article.tags && article.tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@havenwordchurch" />
      <meta name="twitter:creator" content="@havenwordchurch" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={featuredImage} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="application-name" content={orgData.name} />
      
      {/* Geographic Meta Tags for Nigerian Context */}
      <meta name="geo.region" content="NG-OY" />
      <meta name="geo.placename" content="Ibadan" />
      <meta name="geo.position" content="7.3775;3.9470" />
      <meta name="ICBM" content="7.3775, 3.9470" />
      <meta name="DC.title" content={fullTitle} />
      
      {/* Language Meta Tags */}
      <meta httpEquiv="content-language" content="en-NG" />
      
      {/* Church-specific Meta Tags */}
      <meta name="church:denomination" content="Christian" />
      <meta name="church:location" content="Ibadan, Nigeria" />
      <meta name="church:services" content="Sunday 8:00 AM, Sunday 10:30 AM, Wednesday 6:00 PM" />
      
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2)
          }}
        />
      ))}
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="preconnect" href="https://api.whatsapp.com" />
      
      {/* DNS Prefetch for social media domains */}
      <link rel="dns-prefetch" href="//facebook.com" />
      <link rel="dns-prefetch" href="//instagram.com" />
      <link rel="dns-prefetch" href="//youtube.com" />
      <link rel="dns-prefetch" href="//twitter.com" />
    </Helmet>
  );
};

export default SEOHead;