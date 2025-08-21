
import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface MobileOptimizedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  safeArea?: boolean;
}

const MobileOptimizedContainer = forwardRef<HTMLDivElement, MobileOptimizedContainerProps>(
  ({ 
    className, 
    children, 
    maxWidth = 'xl', 
    padding = 'md', 
    safeArea = true,
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-7xl',
      full: 'max-w-full'
    };

    const paddingClasses = {
      none: '',
      sm: 'px-4 py-2',
      md: 'px-4 sm:px-6 lg:px-8 py-4',
      lg: 'px-6 sm:px-8 lg:px-12 py-6'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          safeArea && 'safe-area-insets',
          'touch-manipulation', // Better touch response
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileOptimizedContainer.displayName = 'MobileOptimizedContainer';

export default MobileOptimizedContainer;
