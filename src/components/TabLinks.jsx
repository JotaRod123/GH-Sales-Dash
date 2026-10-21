import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { T } from '../lib/theme';

const SEED = {
  MonsterDay: {
    Ingressos: ['Gold', 'Casadinha'],
    Mentorias: ['BlackMonster', 'Scale Society']
  }
};
const PAYMENT = {
  Ingressos: ['Cartão / À vista'],
  Mentorias: ['Cartão / À vista', 'Recorrência', 'Boleto parcelado']
};
const empty = { campaign:'MonsterDay', category:'Ingressos', product:'Gold', payment_method:'Cartão / À vista', provider:'Eduzz', url:'' };
const inputStyle = {background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:'11px 12px',color:T.text,width:'100%',minWidth:0};
const btn = {background:T.surfaceHov,color:T.text,border:`1px solid ${T.border}`,borderRadius:9,padding:'10px 14px',cursor:'pointer'};
const choices = (xs) => xs.map(x=><option key={x} value={x}>{x}</option>);
export default function TabLinks({ canEdit }) {
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [editing,setEditing]=useState(false);
 const [form,setForm]=useState(empty);
 const [saving,setSaving]=useState(false);
 const [campaign,setCampaign]=useState('MonsterDay');
 const [category,setCategory]=useState('Ingressos');
 const [product,setProduct]=useState('Gold');
 const [method,setMethod]=useState('Cartão / À vista');
 const campaigns=[...new Set([...Object.keys(SEED),...rows.map(r=>r.campaign)])].sort();
 const categories=[...new Set([...(SEED[campaign]?Object.keys(SEED[campaign]):[]),...rows.filter(r=>r.campaign===campaign).map(r=>r.category)])];
 const products=[...new Set([...(SEED[campaign]?.[category]||[]),...rows.filter(r=>r.campaign===campaign&&r.category===category).map(r=>r.product)])];
 const methods=[...new Set([...(PAYMENT[category]||[]),...rows.filter(r=>r.campaign===campaign&&r.category===category&&r.product===product).map(r=>r.payment_method)])];
 const selected=rows.find(r=>r.campaign===campaign&&r.category===category&&r.product===product&&r.payment_method===method);
 async function reload(){setLoading(true);const {data,error:e}=await supabase.from('payment_links').select('*').order('campaign').order('product');setRows(data||[]);setError(e?.message||'');setLoading(false)}
 useEffect(()=>{reload()},[]);
 const changeCampaign=v=>{setCampaign(v);const c=Object.keys(SEED[v]||{})[0]||rows.find(r=>r.campaign===v)?.category||'';setCategory(c);const p=SEED[v]?.[c]?.[0]||rows.find(r=>r.campaign===v&&r.category===c)?.product||'';setProduct(p);setMethod(PAYMENT[c]?.[0]||'')};
 const changeCategory=v=>{setCategory(v);setProduct(SEED[campaign]?.[v]?.[0]||rows.find(r=>r.campaign===campaign&&r.category===v)?.product||'');setMethod(PAYMENT[v]?.[0]||'')};
 const changeProduct=v=>{setProduct(v);setMethod(PAYMENT[category]?.[0]||rows.find(r=>r.product===v)?.payment_method||'')};
 const edit=(r)=>{setForm(r?{...r}: {campaign,category,product,payment_method:method||'Cartão / À vista',provider:method==='Boleto parcelado'?'TMB':'Eduzz',url:''});setEditing(true);setError('')};
 const update=(field,value)=>setForm(f=>({...f,[field]:value,...(field==='payment_method'?{provider:value==='Boleto parcelado'?'TMB':'Eduzz'}:{})}));
 async function save(e){e.preventDefault();if(!canEdit)return;setSaving(true);setError('');const payload={campaign:form.campaign.trim(),category:form.category.trim(),product:form.product.trim(),payment_method:form.payment_method.trim(),provider:form.provider.trim(),url:form.url.trim()};if(!/^https:\/\/\S+$/i.test(payload.url)){setError('Informe um link HTTPS válido.');setSaving(false);return}const result=form.id?await supabase.from('payment_links').update(payload).eq('id',form.id).select('id'):await supabase.from('payment_links').insert(payload).select('id');if(result.error||!result.data?.length){setError(result.error?.message||'Não foi possível salvar. Verifique suas permissões.')}else{setEditing(false);await reload();setCampaign(payload.campaign);setCategory(payload.category);setProduct(payload.product);setMethod(payload.payment_method)}setSaving(false)}
 async function remove(r){if(!canEdit||!window.confirm(`Remover o link de ${r.product} (${r.payment_method})?`))return;const {data,error:e}=await supabase.from('payment_links').delete().eq('id',r.id).select('id');if(e||!data?.length)setError(e?.message||'Não foi possível remover.');else await reload()}
 const label=(name,children)=><label style={{display:'grid',gap:6,fontSize:12,color:T.textSec}}>{name}{children}</label>;
 return <div style={{display:'grid',gap:20,maxWidth:900}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><div><h2 style={{margin:0}}>Central de Links</h2><p style={{color:T.textSec,fontSize:13}}>Escolha a campanha, o produto e a condição de pagamento.</p></div>{canEdit&&<button style={btn} onClick={()=>{setEditing(!editing);setError('')}}>✎ {editing?'Fechar edição':'Editar Links'}</button>}</div>
  {error&&<div role="alert" style={{color:'#ff9c9c',padding:12,border:'1px solid #8d4444',borderRadius:9}}>{error}</div>}
  {editing&&canEdit&&<div style={{background:T.surface,padding:18,borderRadius:14,border:`1px solid ${T.border}`,display:'grid',gap:16}}>
   <h3 style={{margin:0}}>Gerenciar links</h3>
   <form onSubmit={save} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
    {label('Campanha',<input required style={inputStyle} value={form.campaign} onChange={e=>update('campaign',e.target.value)}/>)}
    {label('Categoria',<input required style={inputStyle} value={form.category} onChange={e=>update('category',e.target.value)}/>)}
    {label('Produto',<input required style={inputStyle} value={form.product} onChange={e=>update('product',e.target.value)}/>)}
    {label('Pagamento',<select style={inputStyle} value={form.payment_method} onChange={e=>update('payment_method',e.target.value)}>{choices(['Cartão / À vista','Recorrência','Boleto parcelado'])}</select>)}
    {label('Plataforma',<input required style={inputStyle} value={form.provider} onChange={e=>update('provider',e.target.value)}/>)}
    {label('Link HTTPS',<input required type="url" style={inputStyle} value={form.url} onChange={e=>update('url',e.target.value)} placeholder="https://..."/>)}
    <div style={{display:'flex',gap:8,alignItems:'end'}}><button disabled={saving} type="submit" style={btn}>{saving?'Salvando...':form.id?'Salvar alterações':'Adicionar link'}</button><button type="button" style={btn} onClick={()=>setForm({...empty,campaign,category,product})}>Novo</button></div>
   </form>
   <div style={{display:'grid',gap:8}}>{rows.map(r=><div key={r.id} style={{display:'flex',gap:8,alignItems:'center',justifyContent:'space-between',borderTop:`1px solid ${T.border}`,paddingTop:8,flexWrap:'wrap'}}><span style={{fontSize:12}}>{r.campaign} / {r.category} / {r.product} — {r.provider} ({r.payment_method})</span><div style={{display:'flex',gap:8}}><button style={btn} onClick={()=>edit(r)}>Editar</button><button style={btn} onClick={()=>remove(r)}>Remover</button></div></div>)}</div>
  </div>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12,background:T.surface,padding:18,borderRadius:14}}>
   {label('1. Campanha',<select style={inputStyle} value={campaign} onChange={e=>changeCampaign(e.target.value)}>{choices(campaigns)}</select>)}
   {label('2. Categoria',<select style={inputStyle} value={category} onChange={e=>changeCategory(e.target.value)}>{choices(categories)}</select>)}
   {label('3. Produto',<select style={inputStyle} value={product} onChange={e=>changeProduct(e.target.value)}>{choices(products)}</select>)}
   {label('4. Pagamento',<select style={inputStyle} value={method} onChange={e=>setMethod(e.target.value)}>{choices(methods)}</select>)}
  </div>
  <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:20,display:'grid',gap:12}}>
   <div style={{color:T.textSec,fontSize:12}}>Link selecionado</div><strong>{product} — {method}</strong>
   {loading?<span>Carregando...</span>:selected?<><div style={{fontSize:13,color:T.textSec}}>{selected.provider}</div><div style={{overflowWrap:'anywhere',fontSize:13}}>{selected.url}</div><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button style={btn} onClick={async()=>{try{await navigator.clipboard.writeText(selected.url);setError('')}catch{setError('Não foi possível copiar automaticamente.')}}}>Copiar link</button><a style={{...btn,textDecoration:'none'}} href={selected.url} target="_blank" rel="noopener noreferrer">Abrir link ↗</a></div></>:<span style={{color:T.textSec,fontSize:13}}>Link ainda não cadastrado. Use Editar Links para adicionar.</span>}
  </div>
 </div>;
}
