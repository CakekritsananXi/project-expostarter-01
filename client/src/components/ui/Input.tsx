import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react'; // Import LucideIcon type
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon; // Added icon prop
  iconPosition?: 'left' | 'right'; // Added iconPosition prop
  helperText?: string; // Kept helperText from original changes
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, iconPosition = 'left', helperText, ...props }, ref) => {
    const inputClasses = cn(
      "flex h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 touch-manipulation",
      'appearance-none -webkit-appearance-none', // Remove default mobile styling
      'focus:shadow-lg focus:scale-[1.02]', // Subtle focus enhancement
      {
        'pl-10': Icon && iconPosition === 'left', // Adjust padding if icon is on the left
        'pr-10': Icon && iconPosition === 'right', // Adjust padding if icon is on the right
        'border-red-500 focus:ring-red-500': error, // Error styling
      },
      className
    );

    return (
      <div className="relative w-full space-y-2"> {/* Adjusted container for spacing */}
        {label && (
          <label htmlFor={props.id || props.name} className="text-sm font-medium text-neutral-700 block">
            {label}
          </label>
        )}
        <div className="relative"> {/* Wrapper for input and icon */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <Icon className="h-5 w-5" /> {/* Adjusted icon size */}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            style={{
              fontSize: '16px', // Prevent zoom on iOS
              WebkitAppearance: 'none',
              MozAppearance: 'textfield'
            }}
            {...props}
          />
          {Icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <Icon className="h-5 w-5" /> {/* Adjusted icon size */}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center mt-1"> {/* Added flex for icon and text */}
            <span className="mr-1">⚠️</span> {/* Warning icon */}
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;