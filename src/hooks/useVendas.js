import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const normalizeOrigem = (origem) => origem === 'Tráfego' || origem === 'Trafego' ? 'Tráfego - Clint' : origem;

const normalizeVenda = (v) => {
  const valor = Number(v.valor || 0);
  const origem = normalizeOrigem(v.origem);
  const dentroEvento = v.dentro_evento ?? v.dentroEvento ?? (origem === 'Evento');
  const percentual = Number(v.comissao_percentual ?? v.comissaoPercentual ?? (dentroEvento ? 1 : 2.5));
  return {
    nome: v.nome,
    telefone: v.telefone || '',
    data_venda: v.data_venda || v.dataVenda,
    origem,
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

const normalizeFetched = (row) => ({ ...row, origem: normalizeOrigem(row.origem) });

export function useVendas(userId) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from('vendas').select('*').eq('user_id', userId).order('data_venda', { ascending: true });
    setVendas((data || []).map(normalizeFetched));
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addVenda = async (v) => {
    const payload = { user_id: userId, ...normalizeVenda(v) };
    const tempId = `temp-${Date.now()}`;
    setVendas((prev) => [...prev, { id: tempId, created_at: new Date().toISOString(), ...payload }]);

    const { data, error } = await supabase.from('vendas').insert(payload).select('*').single();
    if (error) {
      setVendas((prev) => prev.filter((item) => item.id !== tempId));
      return { error };
    }
    setVendas((prev) => prev.map((item) => item.id === tempId ? normalizeFetched(data) : item));
    return { error: null };
  };

  const updateVenda = async (id, v) => {
    const current = vendas.find((item) => item.id === id) || {};
    const payload = normalizeVenda({ ...current, ...v });
    const previous = vendas;
    setVendas((prev) => prev.map((item) => item.id === id ? { ...item, ...payload } : item));

    const { data, error } = await supabase.from('vendas').update(payload).eq('id', id).eq('user_id', userId).select('*').single();
    if (error) {
      setVendas(previous);
      return { error };
    }
    setVendas((prev) => prev.map((item) => item.id === id ? normalizeFetched(data) : item));
    return { error: null };
  };

  const deleteVenda = async (id) => {
    const previous = vendas;
    setVendas((prev) => prev.filter((item) => item.id !== id));
    const { error } = await supabase.from('vendas').delete().eq('id', id).eq('user_id', userId);
    if (error) setVendas(previous);
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
    setTeamVendas((data || []).map(normalizeFetched));
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { teamVendas, loading, refetch: fetch };
}
