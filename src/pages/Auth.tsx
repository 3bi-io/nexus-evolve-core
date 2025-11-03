import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <PageLayout showHeader={false} showFooter={false} transition={true}>
      <SEO 
        title={isLogin ? "Login - Access Your AI Platform" : "Sign Up - Start Your AI Journey"}
        description={isLogin ? "Sign in to Oneiros.me to access your AI agents, chat history, and premium features." : "Create your free Oneiros.me account and get 500 daily credits to start using our advanced AI platform."}
        keywords="AI login, AI signup, AI platform access, create AI account"
        canonical="https://oneiros.me/auth"
      />
      <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to continue your AI journey"
              : "Start your journey with our AI assistant"}
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
