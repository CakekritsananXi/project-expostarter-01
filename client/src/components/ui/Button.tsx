import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-sage text-white shadow hover:bg-sage/90 focus-visible:ring-sage",
        secondary: "bg-neutral-200 text-neutral-800 shadow-sm hover:bg-neutral-300 focus-visible:ring-neutral-400",
        outline: "border border-neutral-300 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 focus-visible:ring-neutral-400",
        ghost: "hover:bg-neutral-100 text-neutral-700 focus-visible:ring-neutral-400",
        link: "text-sage underline-offset-4 hover:underline focus-visible:ring-sage",
        danger: "bg-red-500 text-white shadow hover:bg-red-600 focus-visible:ring-red-500",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// Define the custom props for the Button component
interface CustomButtonProps {
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

// Combine variant props with custom props
type ButtonVariantProps = VariantProps<typeof buttonVariants> & CustomButtonProps;

// Define the polymorphic component type
type ButtonProps<T extends React.ElementType> = ButtonVariantProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonVariantProps>;

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps
>(({ className, variant, size, loading, icon: Icon, iconPosition = 'left', children, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="mr-2 h-4 w-4" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="ml-2 h-4 w-4" />
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;