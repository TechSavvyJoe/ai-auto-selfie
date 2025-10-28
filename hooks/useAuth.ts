import { useState, useEffect } from 'react';
import { getSupabaseService, isSupabaseConfigured, UserProfile } from '../services/supabaseService';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseService();

    // Check current session
    const checkAuth = async () => {
      try {
        const currentUser = await supabase.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const profile = await supabase.getUserProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.client!.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await supabase.getUserProfile();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseService();
    await supabase.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isManager = userProfile?.role === 'manager' || isAdmin;

  return {
    user,
    userProfile,
    loading,
    isConfigured,
    signOut,
    isAdmin,
    isManager,
    isAuthenticated: !!user
  };
};
