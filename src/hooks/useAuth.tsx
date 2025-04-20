import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const needsProfileSetup = await checkInitialProfileStatus();
          if (needsProfileSetup) {
            navigate('/initial');
          } else {
            navigate('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkInitialProfileStatus = async () => {
    if (!user) return false;

    const { data: patientData, error } = await supabase
      .from('patients')
      .select('patientid')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking profile status:', error);
      return false;
    }

    return !patientData;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .select('username')
      .eq('username', username)
      .single();

    if (profileData) {
      throw new Error('Username already exists');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    if (data.user?.id) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ 
          id: data.user.id, 
          username 
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        toast.error('Error creating user profile');
        // Don't throw here - the user was created successfully
        // We'll rely on the trigger to create the profile instead
      }
    }

    return data;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signInWithUsername = async (username: string, password: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (profileError || !profileData) {
      throw new Error('Username not found');
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username}@example.com`,
        password
      });

      if (error?.message?.includes('Invalid login credentials')) {
        throw new Error('Username login currently not supported via direct API. Please use email login.');
      }
    } catch (err) {
      try {
        return await signInWithEmail(username, password);
      } catch (emailErr) {
        throw new Error('Invalid username or password');
      }
    }
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    const isEmail = usernameOrEmail.includes('@');
    
    try {
      if (isEmail) {
        return await signInWithEmail(usernameOrEmail, password);
      } else {
        return await signInWithUsername(usernameOrEmail, password);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = () => supabase.auth.signOut();

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });

    if (error) throw error;
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithMagicLink,
    checkInitialProfileStatus
  };
};
