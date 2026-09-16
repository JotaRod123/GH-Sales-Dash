import { useMemo, useState } from 'react';
import { T } from '../lib/theme';

const field = { background:T.bg, border:`1px solid ${T.border}`, color:T.text, borderRadius:6, padding:'7px 8px', fontSize:12, fontFamily:'inherit' };
const card = { background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 };

export default function TabAcoes({ acoes, readOnly, addAcao, updateAcao, deleteAcao }) {
  const [form,setForm] = useState({ lead_nome:'', tipo:'follow_up', data_hora:'', prioridade:'media', status:'pendente', observacao:'' });
  const now = Date.now();
  const resumo = useMemo(()=>({
    hoje: acoes.filter(a=>new Date(a.data_hora).toDateString()===new Date().toDateString() && a.status==='pendente').length,
    atrasadas: acoes.filter(a=>new Date(a.data_hora).getTime()<now && a.status==='pendente').length,
    pendentes: acoes.filter(a=>a.status==='pendente').length,
    concluidas: acoes.filter(a=>a.status==='concluida').length,
  }),[acoes,now]);

  const submit = async()=>{
    if(!form.lead_nome || !form.data_hora) return;
    await addAcao({...form,data_hora:new Date(form.data_hora).toISOString()});
    setForm({ lead_nome:'', tipo:'follow_up', data_hora:'', prioridade:'media', status:'pendente', observacao:'' });
  };

  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:12,marginBottom:20}}>
      {[['Hoje',resumo.hoje],['Atrasadas',resumo.atrasadas],['Pendentes',resumo.pendentes],['Concluídas',resumo.concluidas]].map(([l,v])=><div key={l} style={card}><div style={{color:T.textSec,fontSize:11,textTransform:'uppercase'}}>{l}</div><div style={{fontSize:28,fontWeight:800,marginTop:6}}>{v}</div></div>)}
    </div>

    {!readOnly && <div style={{...card,marginBottom:20}}>
      <div style={{fontWeight:700,marginBottom:12}}>Nova próxima ação</div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1.3fr 1fr 2fr auto',gap:8}}>
        <input style={field} placeholder="Lead" value={form.lead_nome} onChange={e=>setForm({...form,lead_nome:e.target.value})}/>
        <select style={field} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}><option value="follow_up">Follow-up</option><option value="call">Call</option><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option></select>
        <input style={field} type="datetime-local" value={form.data_hora} onChange={e=>setForm({...form,data_hora:e.target.value})}/>
        <select style={field} value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value})}><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select>
        <input style={field} placeholder="Observação" value={form.observacao} onChange={e=>setForm({...form,observacao:e.target.value})}/>
        <button onClick={submit} style={{...field,background:T.accent,color:'#07121f',fontWeight:800,cursor:'pointer'}}>Adicionar</button>
      </div>
    </div>}

    <div style={{...card,overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}><thead><tr>{['Lead','Tipo','Quando','Prioridade','Status','Observação',''].map(h=><th key={h} style={{textAlign:'left',fontSize:11,color:T.textSec,padding:'10px 8px',borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead><tbody>
      {acoes.map(a=><tr key={a.id}>
        <td style={{padding:8}}>{a.lead_nome}</td><td style={{padding:8}}>{a.tipo}</td><td style={{padding:8,fontSize:12}}>{new Date(a.data_hora).toLocaleString('pt-BR')}</td><td style={{padding:8}}>{a.prioridade}</td>
        <td style={{padding:8}}>{readOnly ? a.status : <select style={field} value={a.status} onChange={e=>updateAcao(a.id,{status:e.target.value})}><option value="pendente">Pendente</option><option value="concluida">Concluída</option></select>}</td>
        <td style={{padding:8}}>{a.observacao||'-'}</td><td style={{padding:8}}>{!readOnly&&<button onClick={()=>deleteAcao(a.id)} style={{background:'transparent',border:0,color:T.danger,cursor:'pointer'}}>Excluir</button>}</td>
      </tr>)}
      </tbody></table>
    </div>
  </div>;
}
