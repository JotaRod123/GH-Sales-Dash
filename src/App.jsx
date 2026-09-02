import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setReady(true);
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
      } else {
        setSession(null);
        setProfile(null);
      }
      setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: '#0D1208', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9B70', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14 }}>
      Carregando…
    </div>
  );

  if (!session) return <LoginPage />;

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: '#0D1208', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9B70', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14 }}>
      Carregando perfil…
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
