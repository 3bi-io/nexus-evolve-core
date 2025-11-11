import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface NativeShareProps {
  title: string;
  text: string;
  url?: string;
  files?: string[];
  dialogTitle?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function NativeShare({
  title,
  text,
  url,
  files,
  dialogTitle = 'Share',
  variant = 'outline',
  size = 'default',
  className,
  children
}: NativeShareProps) {
  const handleShare = async () => {
    // Check if native share is available
    if (!Capacitor.isNativePlatform()) {
      // Fallback to Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url
          });
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Web share error:', error);
            toast.error('Failed to share');
          }
        }
      } else {
        // Fallback to clipboard
        try {
          const shareText = `${title}\n\n${text}${url ? `\n\n${url}` : ''}`;
          await navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard');
        } catch (error) {
          console.error('Clipboard error:', error);
          toast.error('Sharing not supported on this device');
        }
      }
      return;
    }

    // Use native share
    try {
      const shareOptions: any = {
        title,
        text,
        dialogTitle
      };

      if (url) {
        shareOptions.url = url;
      }

      if (files && files.length > 0) {
        shareOptions.files = files;
      }

      await Share.share(shareOptions);
    } catch (error: any) {
      // User cancelled sharing is not an error
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        return;
      }
      
      console.error('Native share error:', error);
      toast.error('Failed to share');
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
    >
      {children || (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </>
      )}
    </Button>
  );
}

// Utility function for programmatic sharing
export async function shareContent(options: {
  title: string;
  text: string;
  url?: string;
  files?: string[];
}): Promise<boolean> {
  const { title, text, url, files } = options;

  if (!Capacitor.isNativePlatform()) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return false;
        }
        throw error;
      }
    } else {
      const shareText = `${title}\n\n${text}${url ? `\n\n${url}` : ''}`;
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard');
      return true;
    }
  }

  try {
    const shareOptions: any = { title, text };
    if (url) shareOptions.url = url;
    if (files) shareOptions.files = files;

    await Share.share(shareOptions);
    return true;
  } catch (error: any) {
    if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
      return false;
    }
    throw error;
  }
}
