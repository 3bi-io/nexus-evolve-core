import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Platform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy_link';
type ShareType = 'achievement' | 'milestone' | 'general' | 'referral';

interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  hashtags?: string[];
}

export function useViral() {
  const { user } = useAuth();
  const { toast } = useToast();

  const trackShare = useCallback(async (platform: Platform, shareType: ShareType, metadata?: any) => {
    if (!user) return;

    try {
      await supabase.from('viral_shares').insert({
        user_id: user.id,
        platform,
        share_type: shareType,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, [user]);

  const shareToTwitter = useCallback((options: ShareOptions) => {
    const { text, url, hashtags } = options;
    const hashtagString = hashtags ? hashtags.map(tag => `#${tag}`).join(' ') : '';
    const tweetText = encodeURIComponent(`${text} ${hashtagString}`);
    const tweetUrl = encodeURIComponent(url || window.location.href);
    
    const shareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
    
    trackShare('twitter', 'general', options);
  }, [trackShare]);

  const shareToFacebook = useCallback((options: ShareOptions) => {
    const { url } = options;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || window.location.href)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
    
    trackShare('facebook', 'general', options);
  }, [trackShare]);

  const shareToLinkedIn = useCallback((options: ShareOptions) => {
    const { url, title, text } = options;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || window.location.href)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
    
    trackShare('linkedin', 'general', options);
  }, [trackShare]);

  const shareToWhatsApp = useCallback((options: ShareOptions) => {
    const { text, url } = options;
    const message = encodeURIComponent(`${text} ${url || window.location.href}`);
    const shareUrl = `https://wa.me/?text=${message}`;
    window.open(shareUrl, '_blank');
    
    trackShare('whatsapp', 'general', options);
  }, [trackShare]);

  const shareViaEmail = useCallback((options: ShareOptions) => {
    const { title, text, url } = options;
    const subject = encodeURIComponent(title || 'Check this out!');
    const body = encodeURIComponent(`${text}\n\n${url || window.location.href}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    
    trackShare('email', 'general', options);
  }, [trackShare]);

  const copyLink = useCallback(async (url?: string) => {
    const linkToCopy = url || window.location.href;
    
    try {
      await navigator.clipboard.writeText(linkToCopy);
      toast({
        title: 'Link copied!',
        description: 'The link has been copied to your clipboard.',
      });
      
      trackShare('copy_link', 'general', { url: linkToCopy });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast, trackShare]);

  const shareReferralCode = useCallback((referralCode: string) => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    const text = `Join me on this amazing AI platform! Use my referral code: ${referralCode}`;
    
    return {
      url: referralUrl,
      text,
      shareToTwitter: () => shareToTwitter({ text, url: referralUrl, hashtags: ['AI', 'Innovation'] }),
      shareToFacebook: () => shareToFacebook({ url: referralUrl }),
      shareToLinkedIn: () => shareToLinkedIn({ url: referralUrl, title: 'Join me!', text }),
      shareToWhatsApp: () => shareToWhatsApp({ text, url: referralUrl }),
      shareViaEmail: () => shareViaEmail({ title: 'Join me!', text, url: referralUrl }),
      copyLink: () => copyLink(referralUrl),
    };
  }, [shareToTwitter, shareToFacebook, shareToLinkedIn, shareToWhatsApp, shareViaEmail, copyLink]);

  return {
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    shareToWhatsApp,
    shareViaEmail,
    copyLink,
    shareReferralCode,
    trackShare,
  };
}
