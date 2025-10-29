import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail } from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { motion } from "framer-motion";

interface InviteDialogProps {
  trigger?: React.ReactNode;
}

export const InviteDialog = ({ trigger }: InviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { createReferral } = useReferrals();

  const handleAddEmail = () => {
    if (email && email.includes('@')) {
      setEmails([...emails, email]);
      setEmail("");
    }
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSendInvites = async () => {
    setLoading(true);
    
    try {
      // Create referrals for each email
      await Promise.all(emails.map(email => createReferral(email)));
      
      setEmails([]);
      setOpen(false);
    } catch (error) {
      console.error('Error sending invites:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Friends
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>
            Send personalized invitations to your friends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button onClick={handleAddEmail} variant="secondary">
                Add
              </Button>
            </div>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <Label>Inviting ({emails.length})</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {emails.map((email, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEmail(index)}
                    >
                      Remove
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Each friend will receive a unique referral code to sign up. You'll earn <strong>100 credits</strong> when they join!
            </p>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendInvites}
            disabled={emails.length === 0 || loading}
            className="w-full gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Sending...' : `Send ${emails.length} Invitation${emails.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
