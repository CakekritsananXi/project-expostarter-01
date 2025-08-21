import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  clickable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, clickable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-neutral-200 bg-white shadow-soft',
          'p-4 sm:p-6', // Mobile-first responsive padding
          hover && 'hover:shadow-medium transition-all duration-200',
          clickable && 'cursor-pointer active:scale-[0.98] touch-manipulation',
          clickable && 'hover:shadow-medium hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;