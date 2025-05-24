
import { ReactNode } from 'react';
import { ButtonRTL } from '@/components/ui/button-rtl';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  colorClass?: string;
  children?: ReactNode;
}

export const QuickActionButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled = false, 
  colorClass = "hover:bg-primary/5",
  children 
}: QuickActionButtonProps) => {
  return (
    <ButtonRTL 
      variant="outline" 
      className={`w-full justify-start ${colorClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4 mr-2" />
      {children || label}
    </ButtonRTL>
  );
};
