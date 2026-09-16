import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const normalizeVenda = (v) => {
  const valor = Number(v.valor || 0);
  const dentroEvento = v.dentro_evento ?? v.dentroEvento ?? (v.origem === 'Evento');
  const percentual = Number(v.comissao_percentual ?? v.comissaoPercentual ?? (dentroEvento ? 1 : 2.5));
  return {
    nome: v.nome,
    telefone: v.telefone || '',
    data_venda: v.data_venda || v.dataVenda,
    origem: v.origem,
    produto: v.produto,
    valor,
    observacao: v.observacao || '',
    prospect_id: v.prospect_id || v.prospectId || null,
    condicao_pagamento: v.condicao_pagamento || v.condicaoPagamento || null,
    dentro_evento: Boolean(dentroEvento),
    comissao_percentual: percentual,
    comissao_valor: valor * percentual / 100,
  };
};

export function useVendas(userId) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from('vendas').select('*').eq('user_id', userId).order('data_venda', { ascending: true });
    setVendas(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addVenda = async (v) => {
    const { error } = await supabase.from('vendas').insert({ user_id: userId, ...normalizeVenda(v) });
    if (!error) await fetch();
    return { error };
  };

  const updateVenda = async (id, v) => {
    const current = vendas.find((item) => item.id === id) || {};
    const { error } = await supabase.from('vendas').update(normalizeVenda({ ...current, ...v })).eq('id', id).eq('user_id', userId);
    if (!error) await fetch();
    return { error };
  };

  const deleteVenda = async (id) => {
    const { error } = await supabase.from('vendas').delete().eq('id', id).eq('user_id', userId);
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
    const { data } = await supabase.from('vendas').select('*').order('data_venda', { ascending: true });
    setTeamVendas(data || []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { teamVendas, loading, refetch: fetch };
}
