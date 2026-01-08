import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: 'none' | 'regular' | 'pro' | 'vip';
  membership_expires_at: string | null;
  daily_tasks_used: number;
  last_task_reset_date: string;
  total_earnings: number;
  pending_earnings: number;
  approved_earnings: number;
  tasks_completed: number;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile and admin status
  const fetchProfileAndRole = useCallback(async (userId: string) => {
    try {
      // Run both queries in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle()
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data as Profile);
      } else if (profileResult.error) {
        console.warn('Profile fetch error:', profileResult.error);
      }

      setIsAdmin(!!roleResult.data);
    } catch (error) {
      console.error('Error fetching profile/role:', error);
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRole(user.id);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (session) {
        setSession(session);
        setUser(session.user);
        await fetchProfileAndRole(session.user.id);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authStateSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // First, get any existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          // Clear any corrupted auth data
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-wiatwgizafrqmbggxbdk.auth.token');
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfileAndRole(session.user.id);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener AFTER initial load
    const setupAuthListener = () => {
      authStateSubscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, 'Session exists:', !!session);
          
          if (!mounted) return;
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfileAndRole(session.user.id);
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
          
          setIsLoading(false);
        }
      ).data.subscription;
    };

    // Delay listener setup to avoid race conditions
    setTimeout(setupAuthListener, 100);

    // Set up session refresh timer
    const sessionRefreshInterval = setInterval(async () => {
      if (session && mounted) {
        const expiresIn = session.expires_at - Math.floor(Date.now() / 1000);
        if (expiresIn < 300) { // Refresh if less than 5 minutes left
          console.log('Auto-refreshing session...');
          await refreshSession();
        }
      }
    }, 60000); // Check every minute

    return () => {
      mounted = false;
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }
      clearInterval(sessionRefreshInterval);
    };
  }, [fetchProfileAndRole]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific errors
        if (error.message.includes('Email not confirmed')) {
          return { error: new Error('Please verify your email first. Check your inbox.') };
        }
        
        return { error };
      }
      
      // Update state
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfileAndRole(data.session.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Signing up:', email);
      
      // Use the correct callback URL
      const siteUrl = window.location.origin;
      const redirectUrl = `${siteUrl}/auth/callback`;
      
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }
      
      console.log('Sign up response:', {
        userId: data.user?.id,
        emailConfirmed: data.user?.email_confirmed_at,
        confirmationSent: data.user?.confirmation_sent_at,
        hasSession: !!data.session
      });
      
      // If we get a session immediately, update state
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        if (data.session.user) {
          await fetchProfileAndRole(data.session.user.id);
        }
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};