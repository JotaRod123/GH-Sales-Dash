import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const loadProfile = async (user) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, role')
      .eq('id', user.id)
      .single();
    return data || null;
  };

  useEffect(() => {
    let settled = false;

    const settle = async (session) => {
      if (settled) return;
      settled = true;
      setSession(session ?? null);
      if (session?.user) {
        const p = await loadProfile(session.user);
        setProfile(p);
      }
      setReady(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => settle(session));

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        settled = false;
        setSession(null);
        setProfile(null);
        setReady(true);
        return;
      }
      if (!settled) {
        settle(session);
      } else if (session?.user) {
        setSession(session);
        const p = await loadProfile(session.user);
        setProfile(p);
        setReady(true);
      }
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
      onSignOut={async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = '/GH-Sales-Dash/';
      }}
    />
  );
}
