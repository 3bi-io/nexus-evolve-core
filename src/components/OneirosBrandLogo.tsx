import { cn } from "@/lib/utils";

interface OneirosBrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const OneirosBrandLogo = ({ 
  size = 'md', 
  showText = false,
  className 
}: OneirosBrandLogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/logo-oneiros.png" 
        alt="Oneiros.me Logo" 
        className={cn(sizeMap[size], "object-contain")}
        onError={(e) => {
          console.error('Failed to load logo');
          e.currentTarget.style.display = 'none';
        }}
      />
      {showText && (
        <span className="font-bold text-lg">
          Oneiros.me
        </span>
      )}
    </div>
  );
};
