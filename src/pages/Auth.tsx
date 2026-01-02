import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to chat
  useEffect(() => {
    if (!loading && user) {
      navigate('/chat', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <PageLayout showHeader={false} showFooter={false} transition={true}>
      <SEO 
        title={isLogin ? "Login - Access Your AI Platform" : "Sign Up - Start Your AI Journey"}
        description={isLogin ? "Sign in to Oneiros.me to save your chat history and preferences across devices." : "Create your free Oneiros.me account. Free forever - unlimited access to all features."}
        keywords="AI login, AI signup, AI platform access, create AI account"
        canonical="https://oneiros.me/auth"
      />
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 safe-area-inset">
        {/* Skip Button - Prominent on Mobile */}
        <div className="w-full max-w-md mb-6">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/chat')}
            className="w-full h-14 text-base font-medium border-2 hover:bg-primary/5"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Continue without account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl md:text-3xl">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin
                ? "Sign in to save your chat history and preferences"
                : "Optional account to save preferences (all features work without signing in)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <LoginForm onToggle={() => setIsLogin(false)} />
            ) : (
              <SignUpForm onToggle={() => setIsLogin(true)} />
            )}
          </CardContent>
        </Card>

        {/* Visual indicator that skipping is okay */}
        <p className="text-sm text-muted-foreground mt-6 text-center max-w-xs">
          No account needed — start chatting immediately with full access
        </p>
      </div>
    </PageLayout>
  );
};

export default Auth;
