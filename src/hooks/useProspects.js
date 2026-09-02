import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProspects(userId) {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('prospects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setProspects(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addProspect = async (p) => {
    const { error } = await supabase.from('prospects').insert({
      user_id: userId,
      nome: p.nome,
      contato: p.contato,
      status: p.status,
      observacao: p.observacao || '',
    });
    if (!error) await fetch();
    return { error };
  };

  const updateProspect = async (id, p) => {
    const { error } = await supabase
      .from('prospects')
      .update({
        nome: p.nome,
        contato: p.contato,
        status: p.status,
        observacao: p.observacao || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  const deleteProspect = async (id) => {
    const { error } = await supabase.from('prospects').delete().eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { prospects, loading, addProspect, updateProspect, deleteProspect, refetch: fetch };
}

export function useTeamProspects(enabled) {
  const [teamProspects, setTeamProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false });
    setTeamProspects(data || []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { teamProspects, loading, refetch: fetch };
}
