import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { T } from '../lib/theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('E-mail ou senha incorretos.');
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif", padding: 24,
    }}>
      <div style={{
        background: T.surface, border: '1px solid ' + T.border,
        borderRadius: 14, padding: '40px 36px', width: '100%', maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #C8A84B 0%, #8A6F2A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#0D1208',
          }}>GH</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>GH Sales</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Dashboard comercial</div>
          </div>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textSec }}>
              E-mail
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
              style={{
                background: T.bg,
                border: '1px solid ' + (focusEmail ? T.accent : T.border),
                borderRadius: 7, color: T.text, fontSize: 14, padding: '10px 13px',
                outline: 'none', width: '100%', boxSizing: 'border-box',
                colorScheme: 'dark',
                boxShadow: focusEmail ? '0 0 0 3px ' + T.accentDim : 'none',
                transition: 'border-color .15s, box-shadow .15s',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textSec }}>
              Senha
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              onFocus={() => setFocusPassword(true)}
              onBlur={() => setFocusPassword(false)}
              style={{
                background: T.bg,
                border: '1px solid ' + (focusPassword ? T.accent : T.border),
                borderRadius: 7, color: T.text, fontSize: 14, padding: '10px 13px',
                outline: 'none', width: '100%', boxSizing: 'border-box',
                colorScheme: 'dark',
                boxShadow: focusPassword ? '0 0 0 3px ' + T.accentDim : 'none',
                transition: 'border-color .15s, box-shadow .15s',
              }}
            />
          </div>
          {error && (
            <div style={{
              background: 'rgba(200,90,75,0.1)', border: '1px solid rgba(200,90,75,0.3)',
              borderRadius: 7, padding: '10px 13px', color: T.danger, fontSize: 13,
            }}>
              {error}
            </div>
          )}
          <button
            type="submit" disabled={loading}
            style={{
              background: T.accent, color: '#0D1208', border: 'none',
              borderRadius: 7, padding: '11px', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              marginTop: 4, fontFamily: 'inherit',
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
