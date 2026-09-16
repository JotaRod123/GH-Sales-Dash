import { useMemo, useState } from 'react';
import TabRelatorios from './TabRelatorios';
import { T } from '../lib/theme';

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const n = (v) => Number(v || 0);

export default function TabRelatoriosComTexto(props) {
  const { kpis = [], kpisProsp = [], vendas = [], viewLabel = 'Meus dados' } = props;
  const [copied, setCopied] = useState(false);
  const [showWhatsAppReport, setShowWhatsAppReport] = useState(false);

  const reportText = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const kMes = kpis.filter((k) => String(k.data || '').startsWith(ym));
    const pMes = kpisProsp.filter((k) => String(k.data || '').startsWith(ym));
    const vMes = vendas.filter((v) => String(v.data_venda || v.dataVenda || '').startsWith(ym));

    const comercial = kMes.reduce((a, k) => ({
      leads: a.leads + n(k.leads_novos),
      abordagens: a.abordagens + n(k.abordagem),
      fups: a.fups + n(k.fup),
      negociacao: a.negociacao + n(k.em_negociacao),
      fechados: a.fechados + n(k.fechados),
    }), { leads: 0, abordagens: 0, fups: 0, negociacao: 0, fechados: 0 });

    const prosp = pMes.reduce((a, k) => ({
      prospectados: a.prospectados + n(k.prospectados),
      contatados: a.contatados + n(k.contatados),
      responderam: a.responderam + n(k.responderam),
      reunioes: a.reunioes + n(k.reuniao_agendada),
      convertidos: a.convertidos + n(k.convertido),
    }), { prospectados: 0, contatados: 0, responderam: 0, reunioes: 0, convertidos: 0 });

    const receita = vMes.reduce((s, v) => s + n(v.valor), 0);
    const comissao = vMes.reduce((s, v) => s + n(v.comissao_valor), 0);
    const ticket = vMes.length ? receita / vMes.length : 0;
    const taxaResposta = prosp.contatados ? (prosp.responderam / prosp.contatados) * 100 : 0;
    const taxaConversao = prosp.prospectados ? (prosp.convertidos / prosp.prospectados) * 100 : 0;

    const porOrigem = {};
    vMes.forEach((v) => {
      const origem = v.origem === 'Tráfego' || v.origem === 'Trafego' ? 'Tráfego - Clint' : (v.origem || 'Não informado');
      porOrigem[origem] = (porOrigem[origem] || 0) + 1;
    });
    const origens = Object.entries(porOrigem).sort((a,b)=>b[1]-a[1]).map(([o,q]) => `• ${o}: ${q}`).join('\n');

    return `📊 *RELATÓRIO COMERCIAL — ${viewLabel}*\nPeríodo: ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}\n\n*COMERCIAL*\n• Leads novos: ${comercial.leads}\n• Abordagens: ${comercial.abordagens}\n• Follow-ups: ${comercial.fups}\n• Em negociação: ${comercial.negociacao}\n• Fechados: ${comercial.fechados}\n\n*PROSPECÇÃO*\n• Prospectados: ${prosp.prospectados}\n• Contatados: ${prosp.contatados}\n• Responderam: ${prosp.responderam}\n• Reuniões agendadas: ${prosp.reunioes}\n• Convertidos: ${prosp.convertidos}\n• Taxa de resposta: ${taxaResposta.toFixed(1)}%\n• Conversão da prospecção: ${taxaConversao.toFixed(1)}%\n\n*VENDAS*\n• Vendas: ${vMes.length}\n• Receita: ${brl(receita)}\n• Comissão: ${brl(comissao)}\n• Ticket médio: ${brl(ticket)}${origens ? `\n\n*VENDAS POR ORIGEM*\n${origens}` : ''}`;
  }, [kpis, kpisProsp, vendas, viewLabel]);

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = reportText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return <div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div style={{display:'flex',justifyContent:'flex-end'}}>
      <button
        onClick={() => setShowWhatsAppReport((v) => !v)}
        style={{background:T.accent,color:'#08111B',border:0,borderRadius:9,padding:'10px 14px',fontWeight:800,cursor:'pointer'}}
      >
        {showWhatsAppReport ? 'Ocultar relatório para WhatsApp' : 'Gerar relatório para WhatsApp'}
      </button>
    </div>

    {showWhatsAppReport && <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center',flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:T.text}}>Relatório para WhatsApp</div>
          <div style={{fontSize:12,color:T.textSec,marginTop:4}}>Resumo do mês atual pronto para copiar e enviar.</div>
        </div>
        <button onClick={copyReport} style={{background:copied?T.success:T.accent,color:'#08111B',border:0,borderRadius:9,padding:'10px 14px',fontWeight:800,cursor:'pointer'}}>{copied?'Copiado!':'Copiar relatório'}</button>
      </div>
      <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:12,lineHeight:1.55,color:T.textSec,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:14,margin:'14px 0 0'}}>{reportText}</pre>
    </div>}

    <TabRelatorios {...props} />
  </div>;
}
