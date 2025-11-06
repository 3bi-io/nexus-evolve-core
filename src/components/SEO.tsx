import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SEOHelper } from '@/lib/seo-helper';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  canonicalUrl?: string;
  structuredData?: object | object[];
  schema?: object;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogVideo?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  locale?: string;
  alternateLocales?: string[];
}

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonical,
  canonicalUrl,
  structuredData,
  schema,
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  ogVideo,
  twitterCard = "summary_large_image",
  twitterSite,
  twitterCreator,
  locale = "en_US",
  alternateLocales = [],
}: SEOProps) {
  const location = useLocation();
  const siteUrl = "https://oneiros.me";
  
  const pageMetadata = SEOHelper.generatePageMetadata(location.pathname);
  const finalTitle = title || pageMetadata.title;
  const finalDescription = description || pageMetadata.description;
  
  const keywordsArray = Array.isArray(keywords) 
    ? keywords 
    : keywords 
    ? [keywords] 
    : pageMetadata.keywords || [];
  
  const finalImage = ogImage || pageMetadata.image || '/og-platform-automation.png';
  const fullImageUrl = finalImage.startsWith('http') ? finalImage : `${siteUrl}${finalImage}`;
  
  const finalCanonical = canonicalUrl || canonical || SEOHelper.getCanonicalUrl(location.pathname);
  
  // Generate comprehensive structured data
  const organizationSchema = SEOHelper.generateOrganizationSchema();
  const websiteSchema = SEOHelper.generateWebSiteSchema();
  const serviceSchema = SEOHelper.generateServiceSchema();
  
  const pageStructuredData = structuredData || schema || SEOHelper.generateStructuredData('software', {
    name: finalTitle,
    description: finalDescription,
    image: fullImageUrl,
  });
  
  // Combine all schemas into an array
  const allStructuredData = Array.isArray(pageStructuredData)
    ? [organizationSchema, websiteSchema, serviceSchema, ...pageStructuredData]
    : [organizationSchema, websiteSchema, serviceSchema, pageStructuredData];

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1'
  ].join(', ');

  const alternateLinks = SEOHelper.generateAlternateLinks(location.pathname);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      {keywordsArray.length > 0 && (
        <meta name="keywords" content={keywordsArray.join(', ')} />
      )}
      <meta name="author" content={author || "Oneiros.me"} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Canonical & Alternate Links */}
      <link rel="canonical" href={finalCanonical} />
      {alternateLinks.map((link) => (
        <link key={link.hreflang} rel="alternate" hrefLang={link.hreflang} href={link.href} />
      ))}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:site_name" content="Oneiros.me" />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map((loc) => (
        <meta key={loc} property="og:locale:alternate" content={loc} />
      ))}
      {ogVideo && <meta property="og:video" content={ogVideo} />}
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {pageMetadata.section && <meta property="article:section" content={pageMetadata.section} />}
      {pageMetadata.tags && pageMetadata.tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={finalCanonical} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={finalTitle} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* Additional Social Media Tags */}
      <meta property="fb:app_id" content="your-facebook-app-id" />
      <meta name="pinterest-rich-pin" content="true" />
      
      {/* Mobile & Browser Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#6366f1" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Oneiros.me" />
      <meta name="format-detection" content="telephone=no" />

      {/* Performance & Resource Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="preconnect" href={siteUrl} />

      {/* Structured Data - Multiple Schemas */}
      {allStructuredData.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
    </Helmet>
  );
}
