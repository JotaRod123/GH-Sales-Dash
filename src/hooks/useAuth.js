import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, nome, role')
          .eq('id', session.user.id)
          .single();
        setProfile(data || null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') setSession(session);
      if (event === 'SIGNED_OUT') { setSession(null); setProfile(null); }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const loading = session === undefined;
  const isAdmin = profile?.role === 'administrador';
  const isEspectador = profile?.role === 'espectador';

  return { session, profile, loading, isAdmin, isEspectador, signOut };
}
