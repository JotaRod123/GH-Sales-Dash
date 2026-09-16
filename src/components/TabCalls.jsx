import { useMemo, useState } from 'react';
import { T } from '../lib/theme';

const inputStyle = { background: T.bg, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, padding: '7px 8px', fontFamily: 'inherit', fontSize: 12 };
const cardStyle = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 };

const statusLabel = (status) => ({
  agendada: 'Agendada',
  realizada: 'Realizada',
  no_show: 'Não compareceu',
  remarcada: 'Remarcada',
}[status] || status);

export default function TabCalls({ calls, readOnly, addCall, updateCall, deleteCall }) {
  const [form, setForm] = useState({ lead_nome: '', data_hora: '', tipo: 'diagnostico', produto: 'Health Club', status: 'agendada', resultado: '', proximo_passo: '' });
  const stats = useMemo(() => {
    const agendadas = calls.filter(c => ['agendada','realizada','no_show','remarcada'].includes(c.status)).length;
    const realizadas = calls.filter(c => c.status === 'realizada').length;
    const naoCompareceu = calls.filter(c => c.status === 'no_show').length;
    return { agendadas, realizadas, naoCompareceu, taxaComparecimento: agendadas ? (realizadas / agendadas) * 100 : 0 };
  }, [calls]);

  const submit = async () => {
    if (!form.lead_nome || !form.data_hora) return;
    await addCall({ ...form, data_hora: new Date(form.data_hora).toISOString() });
    setForm({ lead_nome: '', data_hora: '', tipo: 'diagnostico', produto: 'Health Club', status: 'agendada', resultado: '', proximo_passo: '' });
  };

  return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:12, marginBottom:20 }}>
      {[['Agendadas',stats.agendadas],['Realizadas',stats.realizadas],['Não compareceram',stats.naoCompareceu],['Taxa de comparecimento',stats.taxaComparecimento.toFixed(1)+'%']].map(([l,v]) => <div key={l} style={cardStyle}><div style={{color:T.textSec,fontSize:11,textTransform:'uppercase'}}>{l}</div><div style={{fontSize:28,fontWeight:800,marginTop:6}}>{v}</div></div>)}
    </div>

    {!readOnly && <div style={{ ...cardStyle, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:12 }}>Registrar call</div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 1fr 1fr 1fr', gap:8 }}>
        <input style={inputStyle} placeholder="Lead" value={form.lead_nome} onChange={e=>setForm({...form,lead_nome:e.target.value})}/>
        <input style={inputStyle} type="datetime-local" value={form.data_hora} onChange={e=>setForm({...form,data_hora:e.target.value})}/>
        <select style={inputStyle} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}><option value="qualificacao">Qualificação</option><option value="diagnostico">Diagnóstico</option><option value="fechamento">Fechamento</option><option value="follow_up">Follow-up</option></select>
        <select style={inputStyle} value={form.produto} onChange={e=>setForm({...form,produto:e.target.value})}><option>Health Club</option><option>Health Society</option><option>GH Master</option><option>Scale Society</option><option>BlackMonster</option></select>
        <button onClick={submit} style={{ ...inputStyle, cursor:'pointer', background:T.accent, color:'#07121f', fontWeight:800 }}>Adicionar</button>
      </div>
    </div>}

    <div style={{ ...cardStyle, overflowX:'auto' }}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}><thead><tr>{['Lead','Data','Tipo','Produto','Status','Resultado','Próximo passo',''].map(h=><th key={h} style={{textAlign:'left',fontSize:11,color:T.textSec,padding:'10px 8px',borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead><tbody>
        {calls.map(c=><tr key={c.id}>
          <td style={{padding:8}}>{c.lead_nome}</td><td style={{padding:8,fontSize:12}}>{new Date(c.data_hora).toLocaleString('pt-BR')}</td><td style={{padding:8}}>{c.tipo}</td><td style={{padding:8}}>{c.produto||'-'}</td>
          <td style={{padding:8}}>{readOnly ? statusLabel(c.status) : <select style={inputStyle} value={c.status} onChange={e=>updateCall(c.id,{status:e.target.value})}><option value="agendada">Agendada</option><option value="realizada">Realizada</option><option value="no_show">Não compareceu</option><option value="remarcada">Remarcada</option></select>}</td>
          <td style={{padding:8}}>{c.resultado||'-'}</td><td style={{padding:8}}>{c.proximo_passo||'-'}</td>
          <td style={{padding:8}}>{!readOnly && <button onClick={()=>deleteCall(c.id)} style={{background:'transparent',border:0,color:T.danger,cursor:'pointer'}}>Excluir</button>}</td>
        </tr>)}
      </tbody></table>
    </div>
  </div>;
}
