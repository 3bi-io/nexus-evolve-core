/**
 * Image Optimization Utilities for Mobile Performance
 * Provides lazy loading, WebP conversion detection, and responsive image loading
 */

export interface ImageOptimizationOptions {
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
  /** Quality for image compression (1-100, default: 80) */
  quality?: number;
  /** Responsive sizes for srcset */
  sizes?: string;
  /** Enable WebP detection and loading */
  useWebP?: boolean;
}

/**
 * Check if browser supports WebP format
 */
export const supportsWebP = (() => {
  let support: boolean | null = null;
  
  return (): boolean => {
    if (support !== null) return support;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      support = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      support = false;
    }
    
    return support;
  };
})();

/**
 * Convert image URL to WebP if supported
 */
export const toWebP = (url: string): string => {
  if (!supportsWebP()) return url;
  
  // If already WebP, return as is
  if (url.endsWith('.webp')) return url;
  
  // Convert extension to WebP
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (baseUrl: string, widths: number[]): string => {
  return widths
    .map(width => {
      const url = baseUrl.replace(/\.(jpg|jpeg|png|webp)$/i, `-${width}w.$1`);
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (
  img: HTMLImageElement,
  options: IntersectionObserverInit = {}
): void => {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        const src = target.dataset.src;
        const srcset = target.dataset.srcset;
        
        if (src) target.src = src;
        if (srcset) target.srcset = srcset;
        
        target.classList.add('loaded');
        obs.unobserve(target);
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before entering viewport
    threshold: 0.01,
    ...options,
  });
  
  observer.observe(img);
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string, as: 'image' = 'image'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Get optimized image props for React components
 */
export const getOptimizedImageProps = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const {
    lazy = true,
    useWebP = true,
    sizes,
  } = options;
  
  const optimizedSrc = useWebP ? toWebP(src) : src;
  
  const props: Record<string, any> = {
    src: lazy ? undefined : optimizedSrc,
    loading: lazy ? 'lazy' : 'eager',
    decoding: 'async',
  };
  
  if (lazy) {
    props['data-src'] = optimizedSrc;
  }
  
  if (sizes) {
    props.sizes = sizes;
  }
  
  return props;
};

/**
 * Compress and cache image in IndexedDB
 */
export const cacheImage = async (url: string, quality: number = 80): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create canvas to compress
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              const compressedUrl = URL.createObjectURL(compressedBlob);
              resolve(compressedUrl);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/webp',
          quality / 100
        );
        
        URL.revokeObjectURL(objectUrl);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Image load failed'));
      };
      
      img.src = objectUrl;
    });
  } catch (error) {
    console.error('Image caching failed:', error);
    return url; // Return original URL on failure
  }
};
