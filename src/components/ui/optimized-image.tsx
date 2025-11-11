import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedImageProps } from '@/lib/image-optimizer';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lazy?: boolean;
  useWebP?: boolean;
  fallback?: string;
  onLoadComplete?: () => void;
}

/**
 * Optimized Image component with lazy loading, WebP support, and fallback
 * Automatically handles loading states and intersection observer
 */
export function OptimizedImage({
  src,
  alt,
  lazy = true,
  useWebP = true,
  fallback,
  className,
  onLoadComplete,
  ...props
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            const dataSrc = target.dataset.src;
            
            if (dataSrc) {
              target.src = dataSrc;
              target.removeAttribute('data-src');
            }
            
            observer.unobserve(target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(img);

    return () => {
      if (img) observer.unobserve(img);
    };
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallback && imgRef.current) {
      imgRef.current.src = fallback;
    }
  };

  const optimizedProps = getOptimizedImageProps(src, { lazy, useWebP });

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        hasError && 'opacity-50',
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...optimizedProps}
      {...props}
    />
  );
}
