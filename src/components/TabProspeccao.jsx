import { useMemo, useState } from 'react';
import { T } from '../lib/theme';

const STATUS_OPTS = ['Contatado', 'Respondeu', 'Reuniao agendada', 'Convertido', 'Perdido'];
const PRODUTOS = ['Scale or Die','Monsterday','Scale Society','Blackmonster','MedMaster Plan','Health Club','Health Society','GH Master','MFA','Outros'];
const ORIGENS = ['Tráfego - Clint','Evento','Prospeccao','Indicacao'];
const today = () => new Date().toISOString().slice(0, 10);
const formatDateBR = (s) => { if (!s) return ''; const p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };

const formatPhone = (value = '') => {
  const d = String(value).replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};
const formatInstagram = (value = '') => {
  const clean = String(value).replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 30);
  return clean ? `@${clean}` : '';
};
const normalizeOrigin = (o) => ['Trafego','Tráfego'].includes(o) ? 'Tráfego - Clint' : o;

function Card({ children, style = {} }) {
  return <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'20px 24px', ...style }}>{children}</div>;
}
function Label({ children }) { return <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:T.textSec}}>{children}</div>; }
function Input({ label, value, onChange, placeholder='', type='text' }) {
  return <div style={{display:'flex',flexDirection:'column',gap:5}}><Label>{label}</Label><input type={type} value={value || ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:13,padding:'8px 11px',outline:'none',minHeight:36,boxSizing:'border-box'}} /></div>;
}
function Select({ label, value, onChange, options }) {
  return <div style={{display:'flex',flexDirection:'column',gap:5}}><Label>{label}</Label><select value={value} onChange={e=>onChange(e.target.value)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:13,padding:'8px 11px',outline:'none',minHeight:36}}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;
}
function Textarea({ label, value, onChange, placeholder='' }) {
  return <div style={{display:'flex',flexDirection:'column',gap:5}}><Label>{label}</Label><textarea rows={3} value={value || ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:13,padding:'8px 11px',outline:'none',resize:'vertical',fontFamily:'inherit'}} /></div>;
}
function Btn({ children, onClick, variant='primary', disabled=false }) {
  const style = variant==='danger' ? {background:T.danger,color:'#fff'} : variant==='ghost' ? {background:'transparent',color:T.textSec,border:`1px solid ${T.border}`} : variant==='success' ? {background:T.success,color:'#fff'} : {background:T.accent,color:'#08111B'};
  return <button disabled={disabled} onClick={onClick} style={{...style,border:style.border||0,borderRadius:6,padding:'8px 14px',fontWeight:700,cursor:disabled?'not-allowed':'pointer',opacity:disabled?.55:1}}>{children}</button>;
}
function Modal({ title, onClose, children, width=560 }) {
  return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.72)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}><div style={{width:'100%',maxWidth:width,maxHeight:'90vh',overflow:'auto',background:T.surface,border:`1px solid ${T.borderMid}`,borderRadius:12,padding:26}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><strong>{title}</strong><button onClick={onClose} style={{background:'transparent',border:0,color:T.textSec,fontSize:18,cursor:'pointer'}}>×</button></div>{children}</div></div>;
}

const emptyProspect = { nome:'', whatsapp:'', instagram:'', status:'Contatado', observacao:'' };
const emptyVenda = { nome:'', telefone:'', dataVenda:today(), origem:'Prospeccao', produto:'Selecione', produtoOutros:'', valor:'', observacao:'' };

export default function TabProspeccao({ kpisProsp=[], prospects=[], readOnly, viewLabel, saveDay, addProspect, updateProspect, deleteProspect, addVenda, refetchVendas, addCall, deleteCall }) {
  const todayStr = today();
  const [selectedDate,setSelectedDate] = useState(todayStr);
  const day = useMemo(()=>kpisProsp.filter(k=>k.data===selectedDate).reduce((a,k)=>({prospectados:a.prospectados+(k.prospectados||0),contatados:a.contatados+(k.contatados||0),responderam:a.responderam+(k.responderam||0),reuniaoAgendada:a.reuniaoAgendada+(k.reuniao_agendada||0),convertido:a.convertido+(k.convertido||0)}),{prospectados:0,contatados:0,responderam:0,reuniaoAgendada:0,convertido:0}),[kpisProsp,selectedDate]);
  const [current,setCurrent] = useState(day);
  const [form,setForm] = useState(emptyProspect);
  const [edit,setEdit] = useState(null);
  const [del,setDel] = useState(null);
  const [convert,setConvert] = useState(null);
  const [venda,setVenda] = useState(emptyVenda);
  const [saving,setSaving] = useState(false);
  const [fStatus,setFStatus] = useState('');

  const display = readOnly ? day : current;
  const setF = (k,v)=>setForm(p=>({...p,[k]:v}));

  const handleAdd = async()=>{
    if(!form.nome.trim() || (!form.whatsapp && !form.instagram)) return;
    await addProspect({...form, contato: form.whatsapp || form.instagram, whatsapp:form.whatsapp||null, instagram:form.instagram||null});
    setForm(emptyProspect);
  };
  const handleEdit = async()=>{
    if(!edit?.nome?.trim() || (!edit.whatsapp && !edit.instagram && !edit.contato)) return;
    const whatsapp = edit.whatsapp ? formatPhone(edit.whatsapp) : '';
    const instagram = edit.instagram ? formatInstagram(edit.instagram) : '';
    await updateProspect(edit.id,{...edit, contato:whatsapp||instagram||edit.contato||'', whatsapp:whatsapp||null, instagram:instagram||null});
    setEdit(null);
  };
  const handleConvert = async()=>{
    const produto = venda.produto==='Outros'?venda.produtoOutros:venda.produto;
    if(!produto || produto==='Selecione' || !venda.valor) return;
    setSaving(true);
    let callCriada = null;
    try {
      const origem = normalizeOrigin(venda.origem);
      if (addCall) {
        callCriada = await addCall({
          prospect_id: convert.id,
          lead_nome: convert.nome,
          data_hora: new Date().toISOString(),
          tipo: 'fechamento',
          produto,
          status: 'realizada',
          resultado: 'comprou',
          valor_venda: Number(venda.valor),
          origem_venda: origem,
          proximo_passo: '',
          observacao: 'Call criada automaticamente ao converter prospect.'
        });
      }
      const {error}=await addVenda({...venda, origem, produto, prospectId:convert.id, callId:callCriada?.id || null});
      if(error){
        if(callCriada?.id && deleteCall) await deleteCall(callCriada.id);
        setSaving(false);
        return;
      }
      await updateProspect(convert.id,{...convert,status:'Convertido'});
      if(refetchVendas) await refetchVendas();
      setConvert(null);
      setVenda(emptyVenda);
    } finally {
      setSaving(false);
    }
  };

  const monthPrefix = todayStr.slice(0,7);
  const monthAgg = kpisProsp.filter(k=>String(k.data||'').startsWith(monthPrefix)).reduce((a,k)=>({prospectados:a.prospectados+(k.prospectados||0),contatados:a.contatados+(k.contatados||0),responderam:a.responderam+(k.responderam||0),reuniaoAgendada:a.reuniaoAgendada+(k.reuniao_agendada||0),convertido:a.convertido+(k.convertido||0)}),{prospectados:0,contatados:0,responderam:0,reuniaoAgendada:0,convertido:0});
  const funil=[['Prospectados',monthAgg.prospectados],['Contatados',monthAgg.contatados],['Responderam',monthAgg.responderam],['Reunião agendada',monthAgg.reuniaoAgendada],['Convertidos',monthAgg.convertido]];
  const max=Math.max(monthAgg.prospectados,1);
  const filtered=prospects.filter(p=>!fStatus||p.status===fStatus);

  return <div style={{display:'flex',flexDirection:'column',gap:30}}>
    {readOnly&&<div style={{color:T.accent,fontSize:12,fontWeight:700}}>Visualizando: {viewLabel} · somente leitura</div>}

    <div><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginBottom:12}}><Label>KPIs de prospecção · {formatDateBR(selectedDate)}</Label>{!readOnly&&<input type="date" value={selectedDate} max={todayStr} onChange={e=>{setSelectedDate(e.target.value);setCurrent(day)}} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:6,padding:'6px 8px'}}/>}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(130px,1fr))',gap:10}}>{[['prospectados','Prospectados'],['contatados','Contatados'],['responderam','Responderam'],['reuniaoAgendada','Reunião agendada'],['convertido','Convertidos']].map(([k,l])=><Card key={k} style={{padding:16}}><Label>{l}</Label>{readOnly?<div style={{fontSize:28,fontWeight:800,marginTop:8}}>{display[k]||0}</div>:<input type="number" min="0" value={display[k]||0} onChange={e=>setCurrent(p=>({...p,[k]:Number(e.target.value)||0}))} style={{width:'100%',background:'transparent',border:0,borderBottom:`1px solid ${T.borderMid}`,color:T.text,fontSize:28,fontWeight:800,marginTop:8,outline:'none'}}/>}</Card>)}</div>
      {!readOnly&&<div style={{marginTop:12}}><Btn onClick={()=>saveDay(current,selectedDate)}>Salvar KPIs</Btn></div>}
    </div>

    <div><Label>Funil de prospecção · mês atual</Label><Card style={{marginTop:12}}>{funil.map(([l,v])=><div key={l} style={{display:'flex',alignItems:'center',gap:12,margin:'9px 0'}}><div style={{width:150,color:T.textSec,fontSize:12}}>{l}</div><div style={{flex:1,height:26,background:T.bg,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.max((v/max)*100,1)}%`,background:T.accent,borderRadius:6}}/></div><strong style={{width:40,textAlign:'right'}}>{v}</strong></div>)}</Card></div>

    {!readOnly&&<div><Label>Novo prospect</Label><Card style={{marginTop:12}}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12,marginBottom:14}}><Input label="Nome" value={form.nome} onChange={v=>setF('nome',v)} placeholder="Nome do prospect"/><Input label="Telefone" value={form.whatsapp} onChange={v=>setF('whatsapp',formatPhone(v))} placeholder="(11) 99999-9999"/><Input label="Instagram" value={form.instagram} onChange={v=>setF('instagram',formatInstagram(v))} placeholder="@usuario"/><Select label="Status" value={form.status} onChange={v=>setF('status',v)} options={STATUS_OPTS}/></div><Textarea label="Observações" value={form.observacao} onChange={v=>setF('observacao',v)} placeholder="Contexto do prospect..."/><div style={{marginTop:16}}><Btn onClick={handleAdd}>Adicionar prospect</Btn></div></Card></div>}

    <div><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginBottom:12}}><Label>{filtered.length} prospects</Label><select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,borderRadius:6,padding:'6px 8px'}}><option value="">Todos os status</option>{STATUS_OPTS.map(s=><option key={s}>{s}</option>)}</select></div><Card style={{padding:0,overflow:'hidden'}}><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:850}}><thead><tr>{['Nome','Telefone','Instagram','Status','Observações',''].map(h=><th key={h} style={{textAlign:'left',padding:'10px 12px',color:T.textMuted,fontSize:10,textTransform:'uppercase',borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead><tbody>{filtered.map(p=><tr key={p.id} style={{borderBottom:`1px solid ${T.border}`}}><td style={{padding:12,fontWeight:700}}>{p.nome}</td><td style={{padding:12,color:T.textSec}}>{formatPhone(p.whatsapp || (String(p.contato||'').match(/\d/) ? p.contato : '')) || '-'}</td><td style={{padding:12,color:T.textSec}}>{p.instagram || (!String(p.contato||'').match(/\d/) ? p.contato : '') || '-'}</td><td style={{padding:12}}>{p.status}</td><td style={{padding:12,color:T.textSec,maxWidth:260}}>{p.observacao||'-'}</td><td style={{padding:12}}>{!readOnly&&<div style={{display:'flex',gap:6}}><Btn variant="ghost" onClick={()=>setEdit({...p,whatsapp:formatPhone(p.whatsapp || (String(p.contato||'').match(/\d/)?p.contato:'')),instagram:p.instagram || (!String(p.contato||'').match(/\d/)?p.contato:'')})}>Editar</Btn>{p.status!=='Convertido'&&<Btn variant="success" onClick={()=>{setConvert(p);setVenda({...emptyVenda,nome:p.nome,telefone:formatPhone(p.whatsapp || (String(p.contato||'').match(/\d/)?p.contato:''))})}}>Converter</Btn>}<Btn variant="danger" onClick={()=>setDel(p)}>Excluir</Btn></div>}</td></tr>)}</tbody></table></div></Card></div>

    {edit&&<Modal title="Editar prospect" onClose={()=>setEdit(null)}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}><Input label="Nome" value={edit.nome} onChange={v=>setEdit(p=>({...p,nome:v}))}/><Input label="Telefone" value={edit.whatsapp||''} onChange={v=>setEdit(p=>({...p,whatsapp:formatPhone(v)}))} placeholder="(11) 99999-9999"/><Input label="Instagram" value={edit.instagram||''} onChange={v=>setEdit(p=>({...p,instagram:formatInstagram(v)}))} placeholder="@usuario"/><Select label="Status" value={edit.status} onChange={v=>setEdit(p=>({...p,status:v}))} options={STATUS_OPTS}/></div><Textarea label="Observações" value={edit.observacao||''} onChange={v=>setEdit(p=>({...p,observacao:v}))}/><div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:18}}><Btn variant="ghost" onClick={()=>setEdit(null)}>Cancelar</Btn><Btn onClick={handleEdit}>Salvar</Btn></div></Modal>}

    {convert&&<Modal title={`Converter em venda - ${convert.nome}`} onClose={()=>setConvert(null)}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}><Input label="Telefone" value={venda.telefone} onChange={v=>setVenda(p=>({...p,telefone:formatPhone(v)}))} placeholder="(11) 99999-9999"/><Input label="Data da venda" type="date" value={venda.dataVenda} onChange={v=>setVenda(p=>({...p,dataVenda:v}))}/><Select label="Origem" value={venda.origem} onChange={v=>setVenda(p=>({...p,origem:v}))} options={ORIGENS}/><Select label="Produto" value={venda.produto} onChange={v=>setVenda(p=>({...p,produto:v}))} options={['Selecione',...PRODUTOS]}/>{venda.produto==='Outros'&&<Input label="Qual produto?" value={venda.produtoOutros} onChange={v=>setVenda(p=>({...p,produtoOutros:v}))}/>}<Input label="Valor (R$)" type="number" value={venda.valor} onChange={v=>setVenda(p=>({...p,valor:v}))}/></div><Textarea label="Observações" value={venda.observacao} onChange={v=>setVenda(p=>({...p,observacao:v}))}/><div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:18}}><Btn variant="ghost" onClick={()=>setConvert(null)}>Cancelar</Btn><Btn variant="success" disabled={saving} onClick={handleConvert}>{saving?'Registrando...':'Registrar venda'}</Btn></div></Modal>}

    {del&&<Modal title="Excluir prospect" width={400} onClose={()=>setDel(null)}><p style={{color:T.textSec}}>Excluir <strong style={{color:T.text}}>{del.nome}</strong>?</p><div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:18}}><Btn variant="ghost" onClick={()=>setDel(null)}>Cancelar</Btn><Btn variant="danger" onClick={async()=>{await deleteProspect(del.id);setDel(null)}}>Excluir</Btn></div></Modal>}
  </div>;
}
