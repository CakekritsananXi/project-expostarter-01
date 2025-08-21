
import { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  loading?: 'lazy' | 'eager';
  quality?: 'low' | 'medium' | 'high';
}

const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(
  ({ 
    className, 
    src, 
    alt, 
    fallback = '/placeholder.svg',
    aspectRatio,
    loading = 'lazy',
    quality = 'medium',
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const aspectRatioClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      portrait: 'aspect-[3/4]',
      landscape: 'aspect-[4/3]'
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    return (
      <div className={cn(
        'relative overflow-hidden bg-neutral-100 rounded-lg',
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-sage rounded-full animate-spin" />
          </div>
        )}
        
        <img
          ref={ref}
          src={hasError ? fallback : src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            'gpu-accelerated', // Hardware acceleration
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          // Mobile-specific optimizations
          decoding="async"
          fetchPriority={loading === 'eager' ? 'high' : 'low'}
          {...props}
        />
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <span className="text-neutral-400 text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    );
  }
);

ResponsiveImage.displayName = 'ResponsiveImage';

export default ResponsiveImage;
