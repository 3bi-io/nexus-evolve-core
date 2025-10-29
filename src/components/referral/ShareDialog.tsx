import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Mail, Copy } from "lucide-react";
import { useViral } from "@/hooks/useViral";
import { motion } from "framer-motion";

interface ShareDialogProps {
  referralCode: string;
  trigger?: React.ReactNode;
}

export const ShareDialog = ({ referralCode, trigger }: ShareDialogProps) => {
  const [open, setOpen] = useState(false);
  const viral = useViral();
  const shareActions = viral.shareReferralCode(referralCode);

  const socialButtons = [
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      action: shareActions.shareToTwitter,
      color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      action: shareActions.shareToFacebook,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      action: shareActions.shareToLinkedIn,
      color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5" />,
      action: shareActions.shareToWhatsApp,
      color: "hover:bg-[#25D366]/10 hover:text-[#25D366]",
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      action: shareActions.shareViaEmail,
      color: "hover:bg-primary/10 hover:text-primary",
    },
    {
      name: "Copy Link",
      icon: <Copy className="h-5 w-5" />,
      action: shareActions.copyLink,
      color: "hover:bg-accent hover:text-accent-foreground",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share & Earn
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Referral Link</DialogTitle>
          <DialogDescription>
            Invite friends and earn rewards when they sign up!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Your referral code</p>
            <p className="text-lg font-bold text-primary">{referralCode}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {socialButtons.map((button, index) => (
              <motion.div
                key={button.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  className={`w-full flex-col h-auto py-4 ${button.color} transition-colors`}
                  onClick={() => {
                    button.action();
                    if (button.name === "Copy Link") {
                      setTimeout(() => setOpen(false), 1000);
                    }
                  }}
                >
                  {button.icon}
                  <span className="text-xs mt-2">{button.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💰 <strong>Earn 100 credits</strong> for each friend who signs up using your link!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
