import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

export function useCampaignKpis(userId, accessToken) {
  const [campaignKpis, setCampaignKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('kpis_campanhas_diarios')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: true });
    setCampaignKpis(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refetch(); }, [refetch]);

  const saveDay = async (values, date, campanha) => {
    if (!userId) return { error: { message: 'Sessão sem user_id. Faça login novamente.' } };
    if (!accessToken) return { error: { message: 'Sessão expirada. Faça login novamente.' } };
    if (!campanha || campanha === 'Geral') return { error: { message: 'Selecione uma campanha específica para salvar.' } };

    const payload = {
      user_id: userId,
      data: date,
      campanha,
      leads_recebidos: Number(values.leadsRecebidos || 0),
      leads_contatados: Number(values.leadsContatados || 0),
      aguardando_resposta: Number(values.aguardandoResposta || 0),
      em_conversa: Number(values.emConversa || 0),
      reuniao_agendamento: Number(values.reuniaoAgendamento || 0),
      proposta_enviada: Number(values.propostaEnviada || 0),
      sem_interesse: Number(values.semInteresse || 0),
      leads_desqualificados: Number(values.leadsDesqualificados || 0),
      numero_errado: Number(values.numeroErrado || 0),
      numero_teste: Number(values.numeroTeste || 0),
      sem_contato: Number(values.semContato || 0),
      updated_at: new Date().toISOString(),
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      let response;
      try {
        response = await window.fetch(
          `${SUPABASE_URL}/rest/v1/kpis_campanhas_diarios?on_conflict=user_id,data,campanha&select=*`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=representation',
            },
            body: JSON.stringify(payload),
          }
        );
      } finally {
        clearTimeout(timeout);
      }

      const body = await response.json().catch(() => null);
      if (!response.ok) return { error: { message: body?.message || body?.details || `Erro HTTP ${response.status}` } };
      const row = Array.isArray(body) ? body[0] : body;
      if (!row) return { error: { message: 'Supabase não retornou os KPIs salvos.' } };

      setCampaignKpis((prev) => {
        const without = prev.filter((item) => !(item.data === row.data && item.campanha === row.campanha && item.user_id === row.user_id));
        return [...without, row].sort((a,b) => String(a.data).localeCompare(String(b.data)));
      });
      return { data: row, error: null };
    } catch (error) {
      return { error: { message: error?.name === 'AbortError' ? 'O Supabase demorou mais de 8 segundos para responder.' : (error?.message || 'Falha ao salvar KPIs da campanha.') } };
    }
  };

  return { campaignKpis, loading, saveDay, refetch };
}

export function useTeamCampaignKpis(enabled) {
  const [teamCampaignKpis, setTeamCampaignKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('kpis_campanhas_diarios')
      .select('*')
      .order('data', { ascending: true });
    setTeamCampaignKpis(data || []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { refetch(); }, [refetch]);

  return { teamCampaignKpis, loading, refetch };
}
