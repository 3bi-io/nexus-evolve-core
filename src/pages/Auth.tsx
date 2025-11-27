import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
        description={isLogin ? "Sign in to Oneiros.me to save your chat history and preferences across devices." : "Create your free Oneiros.me account. Black Friday special - unlimited access to all features."}
        keywords="AI login, AI signup, AI platform access, create AI account"
        canonical="https://oneiros.me/auth"
      />
      <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/chat')}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip • Continue without account
            </Button>
          </div>
          <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
          <CardDescription>
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
      </div>
    </PageLayout>
  );
};

export default Auth;
