import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role')
      .eq('id', userId)
      .single();
    return data || null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setSession(session);
        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        }
      }
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => supabase.auth.signOut();

  return {
    session,
    profile,
    loading: session === undefined,
    isAdmin: profile?.role === 'administrador',
    isEspectador: profile?.role === 'espectador',
    signOut,
  };
}
