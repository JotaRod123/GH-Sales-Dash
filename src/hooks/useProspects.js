import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const normalizeProspect = (p) => ({
  nome: p.nome,
  contato: p.contato || p.whatsapp || p.instagram || '',
  status: p.status || 'Prospectado',
  observacao: p.observacao || '',
  instagram: p.instagram || null,
  whatsapp: p.whatsapp || null,
  email: p.email || null,
  especialidade: p.especialidade || null,
  cidade: p.cidade || null,
  origem: p.origem || null,
  icp_tipo: p.icp_tipo || null,
  lead_score: p.lead_score || null,
  produto_potencial: p.produto_potencial || null,
  primeira_abordagem: p.primeira_abordagem || null,
  ultimo_contato: p.ultimo_contato || null,
  proxima_acao: p.proxima_acao || null,
  proxima_acao_em: p.proxima_acao_em || null,
  valor_potencial: p.valor_potencial == null ? 0 : Number(p.valor_potencial),
  motivo_perda: p.motivo_perda || null,
});

export function useProspects(userId) {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from('prospects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setProspects(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addProspect = async (p) => {
    const { error } = await supabase.from('prospects').insert({ user_id: userId, ...normalizeProspect(p) });
    if (!error) await fetch();
    return { error };
  };

  const updateProspect = async (id, patch) => {
    const current = prospects.find((p) => p.id === id) || {};
    const merged = normalizeProspect({ ...current, ...patch });
    const { error } = await supabase.from('prospects').update({ ...merged, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
    if (!error) await fetch();
    return { error };
  };

  const deleteProspect = async (id) => {
    const { error } = await supabase.from('prospects').delete().eq('id', id).eq('user_id', userId);
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
    const { data } = await supabase.from('prospects').select('*').order('created_at', { ascending: false });
    setTeamProspects(data || []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { teamProspects, loading, refetch: fetch };
}
