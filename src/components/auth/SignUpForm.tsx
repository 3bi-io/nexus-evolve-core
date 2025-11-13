import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignUpForm = ({ onToggle }: { onToggle: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const { signUp } = useAuth();

  // Detect referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      toast({
        title: "🎉 Referral detected!",
        description: "You'll get bonus credits when you sign up!",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validation = signupSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: "Validation error",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await signUp(email, password);
      
      // If there's a referral code, store it to process after email verification
      if (referralCode) {
        localStorage.setItem('pending_referral_code', referralCode);
      }
      
      toast({ 
        title: referralCode ? "Success! Check your email to verify and claim your bonus!" : "Success! Please check your email to verify your account.",
        description: referralCode ? "You'll receive 50 bonus credits after verification!" : "Click the link in the email to complete signup."
      });
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred during signup";
      
      // Handle specific error cases
      if (errorMessage.includes("User already registered")) {
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {referralCode && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Referral Applied!</p>
            <p className="text-xs text-muted-foreground">Get 50 bonus credits after signup</p>
          </div>
          <Badge variant="secondary">{referralCode}</Badge>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-primary hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};
