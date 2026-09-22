import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSalesOS(userId) {
  const [calls, setCalls] = useState([]);
  const [acoes, setAcoes] = useState([]);
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [{ data: callsData }, { data: acoesData }, { data: metasData }] = await Promise.all([
      supabase.from('calls').select('*').eq('user_id', userId).order('data_hora', { ascending: true }),
      supabase.from('acoes').select('*').eq('user_id', userId).order('data_hora', { ascending: true }),
      supabase.from('metas').select('*').eq('user_id', userId).order('competencia', { ascending: false }),
    ]);
    setCalls(callsData || []);
    setAcoes(acoesData || []);
    setMetas(metasData || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refetch(); }, [refetch]);

  const addCall = async (payload) => {
    const { data, error } = await supabase.from('calls').insert({ ...payload, user_id: userId }).select('*').single();
    if (error) throw error;
    setCalls((prev) => [...prev, data].sort((a,b) => new Date(a.data_hora) - new Date(b.data_hora)));
    return data;
  };

  const updateCall = async (id, payload) => {
    const { data, error } = await supabase.from('calls').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId).select('*').single();
    if (error) throw error;
    setCalls((prev) => prev.map((c) => c.id === id ? data : c));
    return data;
  };

  const deleteCall = async (id) => {
    const { error } = await supabase.from('calls').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await refetch();
  };

  const addAcao = async (payload) => {
    const { error } = await supabase.from('acoes').insert({ ...payload, user_id: userId });
    if (error) throw error;
    await refetch();
  };

  const updateAcao = async (id, payload) => {
    const { error } = await supabase.from('acoes').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await refetch();
  };

  const deleteAcao = async (id) => {
    const { error } = await supabase.from('acoes').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await refetch();
  };

  const upsertMeta = async (payload) => {
    const { error } = await supabase.from('metas').upsert({ ...payload, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id,competencia' });
    if (error) throw error;
    await refetch();
  };

  return { calls, acoes, metas, loading, refetch, addCall, updateCall, deleteCall, addAcao, updateAcao, deleteAcao, upsertMeta };
}
