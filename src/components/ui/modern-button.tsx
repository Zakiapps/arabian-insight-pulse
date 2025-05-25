
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ModernButtonProps extends ButtonProps {
  loading?: boolean;
  state?: 'enabled' | 'disabled';
  visualState?: 'active' | 'inactive';
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  loading = false,
  state = 'enabled',
  visualState = 'inactive',
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || state === 'disabled' || loading;
  
  return (
    <Button
      {...props}
      disabled={isDisabled}
      className={cn(
        'relative transition-all duration-200 transform',
        'hover:scale-105 active:scale-95',
        // Visual state styling
        visualState === 'active' && [
          'bg-green-500 hover:bg-green-600 text-white',
          'border-green-500 shadow-green-500/25'
        ],
        visualState === 'inactive' && [
          'bg-gray-100 hover:bg-gray-200 text-gray-700',
          'border-gray-300'
        ],
        // Disabled state
        isDisabled && [
          'opacity-50 cursor-not-allowed transform-none',
          'hover:scale-100 active:scale-100'
        ],
        className
      )}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      )}
      {children}
    </Button>
  );
};

export const ToggleButton: React.FC<{
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  enabledText?: string;
  disabledText?: string;
  loading?: boolean;
  className?: string;
}> = ({
  enabled,
  onToggle,
  enabledText = 'مفعل',
  disabledText = 'غير مفعل',
  loading = false,
  className
}) => {
  return (
    <ModernButton
      onClick={() => onToggle(!enabled)}
      loading={loading}
      visualState={enabled ? 'active' : 'inactive'}
      className={cn(
        'min-w-[100px] transition-all duration-300',
        className
      )}
    >
      {enabled ? enabledText : disabledText}
    </ModernButton>
  );
};