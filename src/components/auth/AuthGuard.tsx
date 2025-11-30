import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { LoadingPage } from "@/components/layout/LoadingPage";
import { PageLayout } from "@/components/layout/PageLayout";

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  featureName?: string;
  showNavigation?: boolean;
}

export function AuthGuard({ 
  children, 
  fallbackTitle = "Sign In Required",
  fallbackMessage,
  featureName = "this feature",
  showNavigation = true
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingPage showNavigation={showNavigation} cardCount={3} />;
  }

  if (!user) {
    const message = fallbackMessage || `Please sign in to access ${featureName}. Create an account or log in to continue.`;
    
    return (
      <PageLayout showBottomNav={showNavigation}>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">{fallbackTitle}</CardTitle>
              <CardDescription className="text-base">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full h-12"
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full h-12"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return <>{children}</>;
}
