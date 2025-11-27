import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = ({ onToggle }: { onToggle: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: "Validation error",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await signIn(email, password);
      toast({ title: "Welcome back!" });
      navigate('/chat');
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred during login";
      
      // Handle specific error cases
      if (errorMessage.includes("Invalid login credentials")) {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("Email not confirmed")) {
        toast({
          title: "Email not verified",
          description: "Please check your email and verify your account first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
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
      <div className="text-center mb-4">
        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/chat')}
        >
          Skip Login • Continue as Guest
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          All features work without an account
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-primary hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );
};
