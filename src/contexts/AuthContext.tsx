import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: number;
  refreshCredits: (force?: boolean) => Promise<void>;
  deductCredits: (amount: number) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const lastRefreshTime = useRef<number>(0);
  const REFRESH_COOLDOWN = 2 * 60 * 1000; // 2 minutes in milliseconds

  const refreshCredits = async (force = false) => {
    if (!user) {
      setCredits(0);
      return;
    }

    // Check if cooldown period has passed
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;
    
    if (!force && timeSinceLastRefresh < REFRESH_COOLDOWN) {
      console.log('Credit refresh throttled, waiting for cooldown');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-and-deduct-credits', {
        body: { 
          operation: 'check_only',
          userId: user.id
        }
      });

      if (!error && data?.allowed) {
        setCredits(data.remaining || 0);
        lastRefreshTime.current = now; // Update last refresh timestamp
      }
    } catch (error) {
      console.error('Failed to refresh credits:', error);
    }
  };

  const deductCredits = (amount: number) => {
    setCredits(prev => Math.max(0, prev - amount));
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        refreshCredits();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshCredits();
      } else {
        setCredits(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, credits, refreshCredits, deductCredits, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
