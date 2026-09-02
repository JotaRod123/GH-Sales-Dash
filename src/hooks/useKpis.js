import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const today = () => new Date().toISOString().slice(0, 10);

export function useKpis(userId) {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
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

  useEffect(() => { fetch(); }, [fetch]);

  const saveDay = async (values, date) => {
    const payload = {
      user_id: userId,
      data: date || today(),
      leads_novos: values.leadsNovos,
      abordagem: values.abordagem,
      fup: values.fup,
      em_negociacao: values.emNegociacao,
      fechados: values.fechados,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('kpis_diarios')
      .upsert(payload, { onConflict: 'user_id,data' });
    if (!error) await fetch();
    return { error };
  };

  return { kpis, loading, saveDay, refetch: fetch };
}

export function useTeamKpis(enabled) {
  const [teamKpis, setTeamKpis] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
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

  useEffect(() => { fetch(); }, [fetch]);

  return { teamKpis, admins, loading, refetch: fetch };
}
