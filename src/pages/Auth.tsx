import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/chat");
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <AuthLayout>
      <SEO
        title={isLogin ? "Sign In" : "Sign Up"}
        description={isLogin ? "Sign in to your Oneiros account" : "Create your Oneiros account"}
      />
      
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to access your AI workspace"
              : "Start your AI journey with Oneiros"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggle={() => setIsLogin(true)} />
          )}
          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
