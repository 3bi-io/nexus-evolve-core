import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, MessageCircle, Mail, Copy } from "lucide-react";
import { useViral } from "@/hooks/useViral";
import { motion } from "framer-motion";

interface SocialShareButtonsProps {
  referralCode: string;
  variant?: "default" | "compact";
  className?: string;
}

export const SocialShareButtons = ({ 
  referralCode, 
  variant = "default",
  className = "" 
}: SocialShareButtonsProps) => {
  const viral = useViral();
  const shareActions = viral.shareReferralCode(referralCode);

  const buttons = [
    {
      icon: <Twitter className="h-4 w-4" />,
      label: "Twitter",
      action: shareActions.shareToTwitter,
      color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    },
    {
      icon: <Facebook className="h-4 w-4" />,
      label: "Facebook",
      action: shareActions.shareToFacebook,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    },
    {
      icon: <Linkedin className="h-4 w-4" />,
      label: "LinkedIn",
      action: shareActions.shareToLinkedIn,
      color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      label: "WhatsApp",
      action: shareActions.shareToWhatsApp,
      color: "hover:bg-[#25D366]/10 hover:text-[#25D366]",
    },
    {
      icon: <Mail className="h-4 w-4" />,
      label: "Email",
      action: shareActions.shareViaEmail,
      color: "hover:bg-primary/10 hover:text-primary",
    },
    {
      icon: <Copy className="h-4 w-4" />,
      label: "Copy",
      action: shareActions.copyLink,
      color: "hover:bg-accent hover:text-accent-foreground",
    },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {buttons.map((button, index) => (
          <motion.div
            key={button.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={button.action}
              className={`${button.color} transition-colors`}
              title={button.label}
            >
              {button.icon}
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
      {buttons.map((button, index) => (
        <motion.div
          key={button.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Button
            variant="outline"
            onClick={button.action}
            className={`w-full gap-2 ${button.color} transition-colors`}
          >
            {button.icon}
            <span>{button.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
