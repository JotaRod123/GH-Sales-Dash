import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { calcularComissao, seisMesesDepois } from '../lib/comissoes';

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
  const pagamento = v.condicaoPagamento !== undefined ? v.condicaoPagamento : (v.condicao_pagamento || '');
  const comissao = calcularComissao({...v, origem, condicao_pagamento: pagamento});
  const recebida = v.comissao_futura_recebida_em !== undefined ? v.comissao_futura_recebida_em : (v.comissaoFuturaRecebidaEm || null);
  return {
    nome: v.nome,
    telefone: normalizePhone(v.telefone || ''),
    data_venda: v.dataVenda || v.data_venda,
    origem,
    produto: v.produto,
    campanha: v.campanha || null,
    data_entrada_lead: v.dataEntradaLead !== undefined ? (v.dataEntradaLead || null) : (v.data_entrada_lead || null),
    fups_ate_compra: v.fupsAteCompra !== undefined ? (v.fupsAteCompra === '' || v.fupsAteCompra == null ? null : Number(v.fupsAteCompra)) : (v.fups_ate_compra === '' || v.fups_ate_compra == null ? null : Number(v.fups_ate_compra)),
    valor,
    observacao: v.observacao || '',
    prospect_id: v.prospect_id || v.prospectId || null,
    call_id: v.call_id || v.callId || null,
    condicao_pagamento: pagamento || null,
    dentro_evento: dentroEvento,
    comissao_percentual: comissao.percentual,
    comissao_valor: comissao.total,
    comissao_futura_vencimento: comissao.parcelada ? seisMesesDepois(v.dataVenda || v.data_venda) : null,
    comissao_futura_recebida_em: comissao.parcelada ? (recebida || null) : null,
  };
};

const normalizeFetched = (row) => ({ ...row, origem: normalizeOrigem(row.origem), telefone: normalizePhone(row.telefone || '') });

export function useVendas(userId, accessToken) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchVendas = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vendas').select('*').eq('user_id', userId).order('data_venda', { ascending: true });
      if (error) throw error;
      setVendas((data || []).map(normalizeFetched));
      setLoadError('');
    } catch (error) {
      setLoadError(error?.message || 'Falha ao carregar as vendas.');
    } finally {
      setLoading(false);
    }
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
    if (!userId || !id) return {error:{message:'Usuário ou venda inválidos. Entre novamente.'}};
    const current = vendas.find(item => item.id === id);
    if (!current) return {error:{message:'Venda não encontrada na lista. Atualize a página e tente novamente.'}};
    const payload = normalizeVenda({...current, ...v});
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      // getSession oferece token atualizado quando a sessão foi renovada pelo Supabase.
      const {data: authData, error: authError} = await supabase.auth.getSession();
      const token = authData?.session?.access_token;
      if (authError || !token) throw new Error('Sessão expirada. Faça login novamente para editar a venda.');
      const response = await window.fetch(
        `${SUPABASE_URL}/rest/v1/vendas?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(userId)}&select=*`,
        {
          method: 'PATCH',
          signal: controller.signal,
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(payload),
        }
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || body?.details || `Falha ao salvar: HTTP ${response.status}`);
      const saved = Array.isArray(body) ? body[0] : body;
      if (!saved?.id) throw new Error('O banco não confirmou a alteração. Verifique as permissões e tente novamente.');
      setVendas(prev => prev.map(item => item.id === id ? normalizeFetched(saved) : item));
      return {data:normalizeFetched(saved),error:null};
    } catch (error) {
      return {error:{message:error?.name === 'AbortError'
        ? 'O banco demorou a responder. Verifique se a edição foi aplicada antes de tentar novamente.'
        : (error?.message || 'Não foi possível salvar a venda.')}};
    } finally {
      clearTimeout(timeout);
    }
  };

  const deleteVenda = async (id) => {
    const previous = vendas;
    setVendas((prev) => prev.filter((item) => item.id !== id));
    const { error } = await supabase.from('vendas').delete().eq('id', id).eq('user_id', userId);
    if (error) setVendas(previous);
    return { error };
  };

  return { vendas, loading, loadError, addVenda, updateVenda, deleteVenda, refetch: fetchVendas };
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
