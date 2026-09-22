import { useMemo, useState } from 'react';
import { T } from '../lib/theme';

const inputStyle = { background: T.bg, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, padding: '7px 8px', fontFamily: 'inherit', fontSize: 12 };
const cardStyle = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 };
const ORIGENS = ['Tráfego - Clint','Evento','Prospeccao','Indicacao'];
const PRODUTOS = ['Health Club','Health Society','GH Master','Scale Society','BlackMonster','Scale or Die','Monsterday','MedMaster Plan','MFA','Outros'];

const statusLabel = (status) => ({
  agendada: 'Agendada',
  realizada: 'Realizada',
  no_show: 'Não compareceu',
  remarcada: 'Remarcada',
}[status] || status);

const resultadoLabel = (resultado) => ({
  comprou: 'Comprou',
  nao_comprou: 'Não comprou',
}[resultado] || 'Sem resultado');

export default function TabCalls({ calls, readOnly, addCall, updateCall, deleteCall, vendas = [], addVenda, updateVenda, deleteVenda }) {
  const [form, setForm] = useState({ lead_nome: '', data_hora: '', tipo: 'diagnostico', produto: 'Health Club', status: 'agendada', resultado: '', proximo_passo: '' });
  const [drafts, setDrafts] = useState({});
  const [rowError, setRowError] = useState({});

  const stats = useMemo(() => {
    const agendadas = calls.filter(c => ['agendada','realizada','no_show','remarcada'].includes(c.status)).length;
    const realizadas = calls.filter(c => c.status === 'realizada').length;
    const naoCompareceu = calls.filter(c => c.status === 'no_show').length;
    const comprou = calls.filter(c => c.resultado === 'comprou').length;
    const naoComprou = calls.filter(c => c.resultado === 'nao_comprou').length;
    const decididas = comprou + naoComprou;
    return {
      agendadas,
      realizadas,
      naoCompareceu,
      comprou,
      naoComprou,
      taxaComparecimento: agendadas ? (realizadas / agendadas) * 100 : 0,
      conversao: decididas ? (comprou / decididas) * 100 : 0,
    };
  }, [calls]);

  const submit = async () => {
    if (!form.lead_nome || !form.data_hora) return;
    await addCall({ ...form, data_hora: new Date(form.data_hora).toISOString() });
    setForm({ lead_nome: '', data_hora: '', tipo: 'diagnostico', produto: 'Health Club', status: 'agendada', resultado: '', proximo_passo: '' });
  };

  const getDraft = (c) => ({
    valor_venda: drafts[c.id]?.valor_venda ?? String(c.valor_venda || ''),
    origem_venda: drafts[c.id]?.origem_venda ?? c.origem_venda ?? 'Prospeccao',
  });

  const setDraft = (id, field, value) => {
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    setRowError(prev => ({ ...prev, [id]: '' }));
  };

  const syncResultado = async (c, resultado) => {
    const draft = getDraft(c);
    const linkedVenda = vendas.find(v => v.call_id === c.id);

    if (resultado === 'comprou') {
      const valor = Number(draft.valor_venda || 0);
      const origem = draft.origem_venda || 'Prospeccao';
      if (!valor || valor <= 0) {
        setRowError(prev => ({ ...prev, [c.id]: 'Preencha o valor da venda antes de marcar Comprou.' }));
        return;
      }

      await updateCall(c.id, {
        resultado: 'comprou',
        status: 'realizada',
        valor_venda: valor,
        origem_venda: origem,
      });

      const payload = {
        nome: c.lead_nome,
        telefone: '',
        dataVenda: new Date(c.data_hora).toISOString().slice(0,10),
        origem,
        produto: c.produto || 'Outros',
        valor,
        observacao: 'Venda gerada automaticamente pela call.',
        prospectId: c.prospect_id || null,
        callId: c.id,
      };

      if (linkedVenda) await updateVenda(linkedVenda.id, payload);
      else await addVenda(payload);

      setRowError(prev => ({ ...prev, [c.id]: '' }));
      return;
    }

    await updateCall(c.id, {
      resultado: resultado === 'nao_comprou' ? 'nao_comprou' : '',
      status: resultado === 'nao_comprou' ? 'realizada' : c.status,
      valor_venda: resultado === 'nao_comprou' ? 0 : Number(draft.valor_venda || 0),
      origem_venda: draft.origem_venda || null,
    });

    if (linkedVenda && resultado !== 'comprou') await deleteVenda(linkedVenda.id);
    setRowError(prev => ({ ...prev, [c.id]: '' }));
  };

  const statCards = [
    ['Agendadas', stats.agendadas],
    ['Realizadas', stats.realizadas],
    ['Não compareceram', stats.naoCompareceu],
    ['Compraram', stats.comprou],
    ['Não compraram', stats.naoComprou],
    ['Conversão das calls', stats.conversao.toFixed(1) + '%'],
  ];

  return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:20 }}>
      {statCards.map(([l,v]) => <div key={l} style={cardStyle}><div style={{color:T.textSec,fontSize:11,textTransform:'uppercase'}}>{l}</div><div style={{fontSize:28,fontWeight:800,marginTop:6}}>{v}</div></div>)}
    </div>

    {!readOnly && <div style={{ ...cardStyle, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12 }}>Registrar call</div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 1fr 1fr 1fr', gap:8 }}>
        <input style={inputStyle} placeholder="Lead" value={form.lead_nome} onChange={e=>setForm({...form,lead_nome:e.target.value})}/>
        <input style={inputStyle} type="datetime-local" value={form.data_hora} onChange={e=>setForm({...form,data_hora:e.target.value})}/>
        <select style={inputStyle} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}><option value="qualificacao">Qualificação</option><option value="diagnostico">Diagnóstico</option><option value="fechamento">Fechamento</option><option value="follow_up">Follow-up</option></select>
        <select style={inputStyle} value={form.produto} onChange={e=>setForm({...form,produto:e.target.value})}>{PRODUTOS.map(p=><option key={p}>{p}</option>)}</select>
        <button onClick={submit} style={{ ...inputStyle, cursor:'pointer', background:T.accent, color:'#07121f', fontWeight:800 }}>Adicionar</button>
      </div>
    </div>}

    <div style={{ ...cardStyle, overflowX:'auto' }}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:1220}}>
        <thead><tr>{['Lead','Data','Tipo','Produto','Status','Resultado da call','Origem da venda','Valor da venda','Próximo passo',''].map(h=><th key={h} style={{textAlign:'left',fontSize:11,color:T.textSec,padding:'10px 8px',borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
        <tbody>
        {calls.map(c=>{
          const draft=getDraft(c);
          return <tr key={c.id} style={{borderBottom:`1px solid ${T.border}`}}>
            <td style={{padding:8,fontWeight:700}}>{c.lead_nome}</td>
            <td style={{padding:8,fontSize:12}}>{new Date(c.data_hora).toLocaleString('pt-BR')}</td>
            <td style={{padding:8}}>{c.tipo}</td>
            <td style={{padding:8}}>{c.produto||'-'}</td>
            <td style={{padding:8}}>{readOnly ? statusLabel(c.status) : <select style={inputStyle} value={c.status} onChange={e=>updateCall(c.id,{status:e.target.value})}><option value="agendada">Agendada</option><option value="realizada">Realizada</option><option value="no_show">Não compareceu</option><option value="remarcada">Remarcada</option></select>}</td>
            <td style={{padding:8}}>
              {readOnly ? resultadoLabel(c.resultado) : <select style={inputStyle} value={c.resultado || ''} onChange={e=>syncResultado(c,e.target.value)}>
                <option value="">Sem resultado</option>
                <option value="comprou">Comprou</option>
                <option value="nao_comprou">Não comprou</option>
              </select>}
              {rowError[c.id] && <div style={{color:T.danger,fontSize:10,marginTop:5,maxWidth:180}}>{rowError[c.id]}</div>}
            </td>
            <td style={{padding:8}}>{readOnly ? (c.origem_venda||'-') : <select style={inputStyle} value={draft.origem_venda} onChange={e=>setDraft(c.id,'origem_venda',e.target.value)}>{ORIGENS.map(o=><option key={o}>{o}</option>)}</select>}</td>
            <td style={{padding:8}}>{readOnly ? (c.valor_venda ? Number(c.valor_venda).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : '-') : <input style={{...inputStyle,width:115}} type="number" min="0" step="0.01" value={draft.valor_venda} onChange={e=>setDraft(c.id,'valor_venda',e.target.value)} placeholder="R$ 0"/>}</td>
            <td style={{padding:8}}>{c.proximo_passo||'-'}</td>
            <td style={{padding:8}}>{!readOnly && <button onClick={()=>deleteCall(c.id)} style={{background:'transparent',border:0,color:T.danger,cursor:'pointer'}}>Excluir</button>}</td>
          </tr>;
        })}
        </tbody>
      </table>
    </div>
  </div>;
}
