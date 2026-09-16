import { T } from '../lib/theme';

const stages = ['Prospectado','Contatado','Respondeu','Qualificado','Call Agendada','Oportunidade','Negociação','Fechado','Perdido','Nutrição'];

export default function TabPipeline({ prospects, readOnly, updateProspect }) {
  return <div style={{overflowX:'auto',paddingBottom:8}}>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${stages.length}, minmax(220px,1fr))`,gap:10,minWidth:stages.length*230}}>
      {stages.map(stage=>{
        const items=prospects.filter(p=>(p.status||'Prospectado')===stage);
        return <div key={stage} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:10,minHeight:420}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'2px 4px 10px',color:T.textSec,fontSize:12}}><b>{stage}</b><span>{items.length}</span></div>
          {items.map(p=><div key={p.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:12,marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13}}>{p.nome}</div>
            <div style={{fontSize:11,color:T.textSec,marginTop:5}}>{p.produto_potencial||'Produto indefinido'} · {p.origem||'Origem não informada'}</div>
            {p.proxima_acao && <div style={{fontSize:11,color:T.textMuted,marginTop:5}}>Próxima ação: {p.proxima_acao}</div>}
            {!readOnly && <select value={p.status||'Prospectado'} onChange={e=>updateProspect(p.id,{status:e.target.value})} style={{width:'100%',marginTop:10,background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:6,padding:'6px 7px',fontSize:11}}>
              {stages.map(s=><option key={s}>{s}</option>)}
            </select>}
          </div>)}
        </div>
      })}
    </div>
  </div>;
}
