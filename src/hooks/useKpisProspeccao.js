import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const today = () => new Date().toISOString().slice(0, 10);

export function useKpisProspeccao(userId) {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('kpis_prospeccao')
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
      prospectados: values.prospectados,
      contatados: values.contatados,
      responderam: values.responderam,
      reuniao_agendada: values.reuniaoAgendada,
      convertido: values.convertido,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('kpis_prospeccao')
      .upsert(payload, { onConflict: 'user_id,data' });
    if (!error) await fetch();
    return { error };
  };

  return { kpis, loading, saveDay, refetch: fetch };
}

export function useTeamKpisProspeccao(enabled) {
  const [teamKpis, setTeamKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('kpis_prospeccao')
      .select('*')
      .order('data', { ascending: true });
    setTeamKpis(data || []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { teamKpis, loading, refetch: fetch };
}
