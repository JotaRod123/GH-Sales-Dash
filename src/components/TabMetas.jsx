import { useMemo, useState } from 'react';
import { T } from '../lib/theme';

const field={background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:6,padding:'8px 9px',fontSize:12};
const card={background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:16};
const monthStart=()=>new Date().toISOString().slice(0,7)+'-01';

export default function TabMetas({ metas, vendas, calls, kpisProsp, readOnly, upsertMeta }){
  const current=metas.find(m=>m.competencia===monthStart())||{};
  const [form,setForm]=useState({
    competencia:monthStart(),meta_receita:current.meta_receita||0,meta_comissao:current.meta_comissao||0,meta_vendas:current.meta_vendas||0,meta_calls:current.meta_calls||0,meta_prospects:current.meta_prospects||0,meta_abordagens:current.meta_abordagens||0
  });
  const actual=useMemo(()=>{
    const receita=vendas.reduce((s,v)=>s+Number(v.valor||0),0);
    const comissao=vendas.reduce((s,v)=>s+Number(v.comissao_valor||0),0);
    const callsRealizadas=calls.filter(c=>c.status==='realizada').length;
    const prospects=kpisProsp.reduce((s,k)=>s+Number(k.prospectados||0),0);
    const abordagens=kpisProsp.reduce((s,k)=>s+Number(k.contatados||0),0);
    return {receita,comissao,vendas:vendas.length,calls:callsRealizadas,prospects,abordagens};
  },[vendas,calls,kpisProsp]);
  const p=(a,b)=>Number(b)>0?Math.min(100,(Number(a)/Number(b))*100):0;
  const save=()=>upsertMeta({...form,meta_receita:Number(form.meta_receita),meta_comissao:Number(form.meta_comissao),meta_vendas:Number(form.meta_vendas),meta_calls:Number(form.meta_calls),meta_prospects:Number(form.meta_prospects),meta_abordagens:Number(form.meta_abordagens)});
  const rows=[['Receita',actual.receita,form.meta_receita,'R$'],['Comissão',actual.comissao,form.meta_comissao,'R$'],['Vendas',actual.vendas,form.meta_vendas,''],['Calls',actual.calls,form.meta_calls,''],['Prospects',actual.prospects,form.meta_prospects,''],['Abordagens',actual.abordagens,form.meta_abordagens,'']];
  return <div>
    {!readOnly&&<div style={{...card,marginBottom:20}}><div style={{fontWeight:700,marginBottom:12}}>Definir metas do mês</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10}}>
      {Object.entries({meta_receita:'Meta de receita',meta_comissao:'Meta de comissão',meta_vendas:'Meta de vendas',meta_calls:'Meta de calls',meta_prospects:'Meta de prospects',meta_abordagens:'Meta de abordagens'}).map(([key,label])=><label key={key} style={{fontSize:11,color:T.textSec}}>{label}<input type="number" style={{...field,width:'100%',marginTop:5}} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
    </div><button onClick={save} style={{...field,background:T.accent,color:'#07121f',fontWeight:800,cursor:'pointer',marginTop:12}}>Salvar metas</button></div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12}}>{rows.map(([label,atual,meta,prefix])=>{
      const perc=p(atual,meta); return <div key={label} style={card}><div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><b>{label}</b><span style={{color:T.textSec}}>{prefix}{Number(atual).toLocaleString('pt-BR')} / {prefix}{Number(meta||0).toLocaleString('pt-BR')}</span></div><div style={{height:8,background:T.bg,borderRadius:999,overflow:'hidden',marginTop:10}}><div style={{height:'100%',width:`${perc}%`,background:T.accent}}/></div><div style={{fontSize:11,color:T.textMuted,marginTop:6}}>{perc.toFixed(1)}% atingido</div></div>
    })}</div>
  </div>;
}
