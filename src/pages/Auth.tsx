import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
  );
};

export default Auth;
