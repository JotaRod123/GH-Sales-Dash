import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await new Promise(r => setTimeout(r, 500));
      setSession(session ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, nome, role')
          .eq('id', session.user.id)
          .single();
        setProfile(data || null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        return;
      }
      if (session?.user) {
        setSession(session);
        const { data } = await supabase
          .from('profiles')
          .select('id, nome, role')
          .eq('id', session.user.id)
          .single();
        setProfile(data || null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return (
    <div style={{ minHeight: '100vh', background: '#0D1208', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9B70', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14 }}>
      Carregando…
    </div>
  );

  if (!session) return <LoginPage />;

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: '#0D1208', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9B70', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14 }}>
      Carregando…
    </div>
  );

  return (
    <Dashboard
      profile={profile}
      isAdmin={profile.role === 'administrador'}
      isEspectador={profile.role === 'espectador'}
      onSignOut={async () => { await supabase.auth.signOut(); }}
    />
  );
}
