import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

const normalizeOrigem = (origem) => origem === 'Tráfego' || origem === 'Trafego' ? 'Tráfego - Clint' : origem;
const normalizePhone = (value = '') => {
  const d = String(value).replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};

const normalizeVenda = (v) => {
  const valor = Number(v.valor || 0);
  const origem = normalizeOrigem(v.origem);
  const dentroEvento = origem === 'Evento';
  const percentual = dentroEvento ? 1 : 2.5;
  return {
    nome: v.nome,
    telefone: normalizePhone(v.telefone || ''),
    data_venda: v.data_venda || v.dataVenda,
    origem,
    produto: v.produto,
    valor,
    observacao: v.observacao || '',
    prospect_id: v.prospect_id || v.prospectId || null,
    call_id: v.call_id || v.callId || null,
    condicao_pagamento: v.condicao_pagamento || v.condicaoPagamento || null,
    dentro_evento: dentroEvento,
    comissao_percentual: percentual,
    comissao_valor: valor * percentual / 100,
  };
};

const normalizeFetched = (row) => ({ ...row, origem: normalizeOrigem(row.origem), telefone: normalizePhone(row.telefone || '') });

export function useVendas(userId, accessToken) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendas = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from('vendas').select('*').eq('user_id', userId).order('data_venda', { ascending: true });
    setVendas((data || []).map(normalizeFetched));
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchVendas(); }, [fetchVendas]);

  const addVenda = async (v) => {
    if (!userId) {
      return { error: { message: 'Sessão sem user_id. Faça login novamente.' } };
    }

    const payload = { user_id: userId, ...normalizeVenda(v) };

    try {
      if (!accessToken) {
        return { error: { message: 'Sessão expirada. Faça login novamente.' } };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const query = payload.call_id ? '?on_conflict=call_id&select=*' : '?select=*';

      let response;
      try {
        response = await window.fetch(`${SUPABASE_URL}/rest/v1/vendas${query}`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Prefer: payload.call_id ? 'resolution=merge-duplicates,return=representation' : 'return=representation',
          },
          body: JSON.stringify(payload),
        });
      } finally {
        clearTimeout(timeout);
      }

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        return { error: { message: body?.message || body?.details || `Erro HTTP ${response.status}` } };
      }

      const row = Array.isArray(body) ? body[0] : body;
      if (!row) return { error: { message: 'Supabase não retornou a venda salva.' } };

      const saved = normalizeFetched(row);
      setVendas((prev) => {
        const withoutSame = prev.filter((item) => item.id !== saved.id && (!saved.call_id || item.call_id !== saved.call_id));
        return [...withoutSame, saved].sort((a,b) => String(a.data_venda || '').localeCompare(String(b.data_venda || '')));
      });
      return { data: saved, error: null };
    } catch (error) {
      const message = error?.name === 'AbortError'
        ? 'O Supabase demorou mais de 8 segundos para responder. Tente novamente.'
        : (error?.message || 'Falha inesperada ao salvar venda.');
      return { error: { message } };
    }
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

  return { vendas, loading, addVenda, updateVenda, deleteVenda, refetch: fetchVendas };
}

export function useTeamVendas(enabled) {
  const [teamVendas, setTeamVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamVendas = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('vendas').select('*').order('data_venda', { ascending: true });
    setTeamVendas((data || []).map(normalizeFetched));
    setLoading(false);
  }, [enabled]);

  useEffect(() => { fetchTeamVendas(); }, [fetchTeamVendas]);

  return { teamVendas, loading, refetch: fetchTeamVendas };
}
