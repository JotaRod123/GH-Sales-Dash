import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) console.error('Erro ao buscar profile:', error.message);
      setProfile(data || null);
    } catch (e) {
      console.error('Erro inesperado:', e);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => supabase.auth.signOut();

  const isAdmin = profile?.role === 'administrador';
  const isEspectador = profile?.role === 'espectador';

  return { session, profile, loading, isAdmin, isEspectador, signOut };
}
