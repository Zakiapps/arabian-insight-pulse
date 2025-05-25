
import React from 'react';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'col';
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  className,
  spacing = 'md',
  direction = 'col'
}) => {
  const spacingClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div 
      className={cn(
        'flex w-full',
        direction === 'col' ? 'flex-col' : 'flex-row',
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};

export const ModernGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  className?: string;
  responsive?: boolean;
}> = ({ children, cols = 1, className, responsive = true }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-12'
  };

  return (
    <div 
      className={cn(
        'grid gap-6 w-full',
        responsive ? gridCols[cols] : `grid-cols-${cols}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export const ModernCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}> = ({ children, className, padding = 'md', shadow = 'sm', border = false }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div 
      className={cn(
        'bg-background rounded-lg',
        paddingClasses[padding],
        shadowClasses[shadow],
        border && 'border border-border',
        'transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
};

export const FluidContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}> = ({ children, className, maxWidth = '2xl' }) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div 
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};
