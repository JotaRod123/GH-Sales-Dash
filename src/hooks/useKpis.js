import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

const today = () => new Date().toISOString().slice(0, 10);

export function useKpis(userId, accessToken) {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKpis = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('kpis_diarios')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: true });
    setKpis(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchKpis(); }, [fetchKpis]);

  const saveDay = async (values, date) => {
    if (!userId) return { error: { message: 'Sessão sem user_id. Faça login novamente.' } };
    if (!accessToken) return { error: { message: 'Sessão expirada. Faça login novamente.' } };

    const payload = {
      user_id: userId,
      data: date || today(),
      leads_novos: Number(values.leadsNovos || 0),
      abordagem: Number(values.abordagem || 0),
      fup: Number(values.fup || 0),
      em_negociacao: Number(values.emNegociacao || 0),
      fechados: Number(values.fechados || 0),
      updated_at: new Date().toISOString(),
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      let response;
      try {
        response = await window.fetch(
          `${SUPABASE_URL}/rest/v1/kpis_diarios?on_conflict=user_id,data&select=*`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=representation',
            },
            body: JSON.stringify(payload),
          }
        );
      } finally {
        clearTimeout(timeout);
      }

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        return { error: { message: body?.message || body?.details || `Erro HTTP ${response.status}` } };
      }

      const row = Array.isArray(body) ? body[0] : body;
      if (!row) return { error: { message: 'Supabase não retornou os KPIs salvos.' } };

      setKpis((prev) => {
        const without = prev.filter((item) => item.data !== payload.data);
        return [...without, row].sort((a, b) => a.data.localeCompare(b.data));
      });
      return { data: row, error: null };
    } catch (error) {
      const message = error?.name === 'AbortError'
        ? 'O Supabase demorou mais de 8 segundos para responder. Tente novamente.'
        : (error?.message || 'Falha inesperada ao salvar KPIs.');
      return { error: { message } };
    }
  };

  return { kpis, loading, saveDay, refetch: fetchKpis };
}

export function useTeamKpis(enabled) {
  const [teamKpis, setTeamKpis] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamKpis = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const [kpisRes, profilesRes] = await Promise.all([
      supabase.from('kpis_diarios').select('*').order('data', { ascending: true }),
      supabase.from('profiles').select('id, nome, role').eq('role', 'administrador'),
    ]);
    setTeamKpis(kpisRes.data || []);
    setAdmins(profilesRes.data || []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetchTeamKpis(); }, [fetchTeamKpis]);

  return { teamKpis, admins, loading, refetch: fetchTeamKpis };
}
