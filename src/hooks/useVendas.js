import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useVendas(userId) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('vendas')
      .select('*')
      .eq('user_id', userId)
      .order('data_venda', { ascending: true });
    setVendas(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addVenda = async (v) => {
    const { error } = await supabase.from('vendas').insert({
      user_id: userId,
      nome: v.nome,
      telefone: v.telefone || '',
      data_venda: v.dataVenda,
      origem: v.origem,
      produto: v.produto,
      valor: parseFloat(v.valor),
      observacao: v.observacao || '',
      prospect_id: v.prospectId || null,
    });
    if (!error) await fetch();
    return { error };
  };

  const updateVenda = async (id, v) => {
    const { error } = await supabase
      .from('vendas')
      .update({
        nome: v.nome,
        telefone: v.telefone || '',
        data_venda: v.dataVenda,
        origem: v.origem,
        produto: v.produto,
        valor: parseFloat(v.valor),
        observacao: v.observacao || '',
      })
      .eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  const deleteVenda = async (id) => {
    const { error } = await supabase.from('vendas').delete().eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { vendas, loading, addVenda, updateVenda, deleteVenda, refetch: fetch };
}

export function useTeamVendas(enabled) {
  const [teamVendas, setTeamVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('vendas')
      .select('*')
      .order('data_venda', { ascending: true });
    setTeamVendas(data || []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { teamVendas, loading, refetch: fetch };
}
