import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SEOHelper } from '@/lib/seo-helper';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string | string[]; // Support both string and string[] for backward compatibility
  ogImage?: string;
  ogType?: string;
  canonical?: string; // Keep old prop for backward compatibility
  canonicalUrl?: string;
  structuredData?: object;
  schema?: object; // Keep old prop for backward compatibility
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonical, // Old prop
  canonicalUrl, // New prop
  structuredData,
  schema, // Old prop
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const location = useLocation();
  const siteUrl = "https://65580e8a-f56c-4de3-8418-f23a06a1eb6e.lovableproject.com";
  
  const pageMetadata = SEOHelper.generatePageMetadata(location.pathname);
  const finalTitle = title || pageMetadata.title;
  const finalDescription = description || pageMetadata.description;
  
  // Handle both string and string[] for keywords (backward compatibility)
  const keywordsArray = Array.isArray(keywords) 
    ? keywords 
    : keywords 
    ? [keywords] 
    : pageMetadata.keywords || [];
  
  const finalImage = ogImage || pageMetadata.image || '/og-image.png';
  
  const fullImageUrl = finalImage.startsWith('http') ? finalImage : `${siteUrl}${finalImage}`;
  
  // Support both old 'canonical' and new 'canonicalUrl' props
  const finalCanonical = canonicalUrl || canonical || SEOHelper.getCanonicalUrl(location.pathname);

  // Support both old 'schema' and new 'structuredData' props
  const finalStructuredData = structuredData || schema || SEOHelper.generateStructuredData('software', {
    name: finalTitle,
    description: finalDescription,
    image: fullImageUrl,
  });

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      {keywordsArray.length > 0 && (
        <meta name="keywords" content={keywordsArray.join(', ')} />
      )}
      <link rel="canonical" href={finalCanonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Oneiros.me" />
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={finalCanonical} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={fullImageUrl} />

      <meta name="robots" content="index, follow" />
      <meta name="author" content={author || "Oneiros.me"} />

      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
}
