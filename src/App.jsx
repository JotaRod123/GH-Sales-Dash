import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { session, profile, loading, isAdmin, isEspectador, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0D1208',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#8A9B70', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14,
      }}>
        Carregando…
      </div>
    );
  }

  if (!session) return <LoginPage />;

  if (session && !profile) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0D1208',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#8A9B70', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14,
      }}>
        Carregando perfil…
      </div>
    );
  }

  return (
    <Dashboard
      profile={profile}
      isAdmin={isAdmin}
      isEspectador={isEspectador}
      onSignOut={signOut}
    />
  );
}
