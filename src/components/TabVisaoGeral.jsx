import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CAMPAIGNS } from '../lib/campaigns';
import { T } from '../lib/theme';

const today = () => new Date().toISOString().slice(0, 10);
const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDateBR = (s) => {
  if (!s) return '';
  const [y,m,d] = String(s).slice(0,10).split('-');
  return `${d}/${m}/${y}`;
};
const formatShort = (s) => formatDateBR(s).slice(0,5);

const KPI_LABELS = {
  leadsRecebidos: 'Leads recebidos',
  leadsContatados: 'Leads contatados',
  aguardandoResposta: 'Aguardando resposta',
  emConversa: 'Em conversa',
  reuniaoAgendamento: 'Reunião / agendamento',
  propostaEnviada: 'Proposta / oferta enviada',
  semInteresse: 'Sem interesse',
  numeroErrado: 'Número cadastrado errado',
  numeroTeste: 'Número de teste',
  semContato: 'Sem contato realizado',
};

const EMPTY = Object.keys(KPI_LABELS).reduce((a,k) => ({ ...a, [k]: 0 }), {});

const normalize = (r) => ({
  userId: r.user_id,
  date: r.data,
  campanha: r.campanha,
  leadsRecebidos: Number(r.leads_recebidos || 0),
  leadsContatados: Number(r.leads_contatados || 0),
  aguardandoResposta: Number(r.aguardando_resposta || 0),
  emConversa: Number(r.em_conversa || 0),
  reuniaoAgendamento: Number(r.reuniao_agendamento || 0),
  propostaEnviada: Number(r.proposta_enviada || 0),
  semInteresse: Number(r.sem_interesse || 0),
  numeroErrado: Number(r.numero_errado || 0),
  numeroTeste: Number(r.numero_teste || 0),
  semContato: Number(r.sem_contato || 0),
});

const sumRows = (rows) => rows.reduce((acc,row) => {
  Object.keys(KPI_LABELS).forEach((k) => { acc[k] += Number(row[k] || 0); });
  return acc;
}, { ...EMPTY });

function Card({ children, style={} }) {
  return <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:18, ...style }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.09em', textTransform:'uppercase', color:T.textSec }}>{children}</div>;
}
function KpiCard({ label, value, editable, onChange }) {
  return <div style={{ background:T.surface,border:`1px solid ${editable ? T.borderMid : T.border}`,borderRadius:10,padding:'15px 16px',minHeight:100 }}>
    <Label>{label}</Label>
    {editable ? (
      <input
        type="number"
        min="0"
        value={value}
        onChange={e=>onChange(Math.max(0, parseInt(e.target.value) || 0))}
        style={{marginTop:10,width:'100%',boxSizing:'border-box',background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,outline:'none',color:T.text,fontSize:28,fontWeight:900,padding:'7px 9px'}}
      />
    ) : (
      <div style={{marginTop:10,fontSize:28,fontWeight:900,color:T.text}}>{value}</div>
    )}
  </div>;
}

export default function TabVisaoGeral({ campaignKpis = [], vendas = [], readOnly, viewLabel, saveCampaignDay }) {
  const rows = useMemo(()=>campaignKpis.map(normalize),[campaignKpis]);
  const [campaign,setCampaign] = useState('MonsterDay');
  const [date,setDate] = useState(today());
  const [current,setCurrent] = useState({ ...EMPTY });
  const [saving,setSaving] = useState(false);
  const [saveError,setSaveError] = useState('');
  const [saved,setSaved] = useState(false);
  const [showReport,setShowReport] = useState(false);
  const [copied,setCopied] = useState(false);

  const isGeneral = campaign === 'Geral';
  const editable = !readOnly && !isGeneral;

  const dayRows = useMemo(()=>rows.filter(r => r.date === date && (isGeneral || r.campanha === campaign)),[rows,date,campaign,isGeneral]);
  const dayAgg = useMemo(()=>sumRows(dayRows),[dayRows]);

  useEffect(()=>setCurrent(dayAgg),[date,campaign,readOnly,JSON.stringify(dayAgg)]);
  const display = editable ? current : dayAgg;

  const filterSales = (from,to) => vendas.filter(v => {
    const d = String(v.data_venda || v.dataVenda || '').slice(0,10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return isGeneral ? true : String(v.campanha || '') === campaign;
  });

  const salesDay = filterSales(date,date);
  const revenueDay = salesDay.reduce((s,v)=>s+Number(v.valor||0),0);
  const ticketDay = salesDay.length ? revenueDay / salesDay.length : 0;

  const accumulatedRows = rows.filter(r => r.date <= date && (isGeneral || r.campanha === campaign));
  const accumulated = sumRows(accumulatedRows);
  const accumulatedSales = filterSales('',date);

  const monthStart = date.slice(0,7) + '-01';
  const monthSales = filterSales(monthStart, date);
  const monthRevenue = monthSales.reduce((s,v)=>s+Number(v.valor||0),0);
  const monthTicket = monthSales.length ? monthRevenue / monthSales.length : 0;
  const monthLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { month:'long', year:'numeric' });

  const y = new Date(date+'T12:00:00');
  y.setDate(y.getDate()-1);
  const yesterday = y.toISOString().slice(0,10);
  const yesterdayAgg = sumRows(rows.filter(r => r.date === yesterday && (isGeneral || r.campanha === campaign)));

  const save = async () => {
    if (!editable) return;
    setSaving(true); setSaveError(''); setSaved(false);
    const result = await saveCampaignDay(current,date,campaign);
    setSaving(false);
    if (result?.error) { setSaveError(result.error.message || 'Não foi possível salvar.'); return; }
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  const report = useMemo(()=>{
    const now=new Date();
    const hh=String(now.getHours()).padStart(2,'0');
    const mm=String(now.getMinutes()).padStart(2,'0');
    const title=campaign.toUpperCase();
    return `📊 VOLUMETRIA DE LEADS – ${title}

🕣 Horário da atualização: ${hh}:${mm}

📅 Ontem – ${formatShort(yesterday)}
• ${campaign}: ${yesterdayAgg.leadsRecebidos} leads

📅 Hoje – ${formatShort(date)} (até agora)
• ${campaign}: ${display.leadsRecebidos} leads

📈 Total acumulado da campanha: ${accumulated.leadsRecebidos}

————————————————————————————————

🎯 PERFORMANCE COMERCIAL – ${title}

📅 Hoje – ${formatShort(date)}

• Leads recebidos: ${display.leadsRecebidos}
• Leads contatados: ${display.leadsContatados}
• Aguardando resposta: ${display.aguardandoResposta}
• Em conversa: ${display.emConversa}
• Reunião/agendamento: ${display.reuniaoAgendamento}
• Proposta/oferta enviada: ${display.propostaEnviada}
• Compras realizadas: ${salesDay.length}
• Sem interesse: ${display.semInteresse}
• Número cadastrado errado: ${display.numeroErrado}
• Número de teste: ${display.numeroTeste}
• Sem contato realizado: ${display.semContato}

💰 Resultado
• Vendas: ${salesDay.length}
• Faturamento: ${brl(revenueDay)}`;
  },[campaign,date,display,yesterday,yesterdayAgg.leadsRecebidos,accumulated.leadsRecebidos,salesDay.length,revenueDay]);

  const copy=async()=>{try{await navigator.clipboard.writeText(report);setCopied(true);setTimeout(()=>setCopied(false),1600);}catch{}};

  const month = date.slice(0,7);
  const chartRows = Array.from({length:new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate()},(_,i)=>{
    const d=`${month}-${String(i+1).padStart(2,'0')}`;
    const a=sumRows(rows.filter(r=>r.date===d&&(isGeneral||r.campanha===campaign)));
    const s=vendas.filter(v=>String(v.data_venda||v.dataVenda||'').slice(0,10)===d&&(isGeneral||String(v.campanha||'')===campaign)).length;
    return {name:String(i+1).padStart(2,'0'),recebidos:a.leadsRecebidos,contatados:a.leadsContatados,reunioes:a.reuniaoAgendamento,vendas:s};
  });

  return <div style={{display:'flex',flexDirection:'column',gap:24}}>
    {readOnly && <div style={{color:T.accent,fontSize:12,fontWeight:700}}>Visualizando: {viewLabel} · somente leitura</div>}

    <Card>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12,alignItems:'end'}}>
        <div><Label>Campanha</Label><select value={campaign} onChange={e=>setCampaign(e.target.value)}
          style={{width:'100%',marginTop:6,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,padding:'10px 11px'}}>
          <option>Geral</option>{CAMPAIGNS.map(c=><option key={c}>{c}</option>)}
        </select></div>
        <div><Label>Data</Label><input type="date" value={date} max={today()} onChange={e=>setDate(e.target.value)}
          style={{width:'100%',marginTop:6,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,padding:'9px 11px',colorScheme:'dark'}}/></div>
        <div style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>
          {isGeneral ? 'Geral soma automaticamente todas as campanhas.' : editable ? 'Edite os campos abaixo e salve os KPIs do dia.' : 'Visualização consolidada.'}
        </div>
      </div>
    </Card>

    <div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:T.textSec,marginBottom:12}}>KPIs operacionais · {campaign}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10}}>
        {Object.entries(KPI_LABELS).map(([k,label])=><KpiCard key={k} label={label} value={display[k]} editable={editable} onChange={v=>setCurrent(p=>({...p,[k]:v}))}/>)}
      </div>
      {editable && <div style={{display:'flex',gap:10,alignItems:'center',marginTop:12,flexWrap:'wrap'}}>
        <button onClick={save} disabled={saving} style={{background:T.accent,color:'#08111B',border:0,borderRadius:8,padding:'10px 16px',fontWeight:900,cursor:'pointer',opacity:saving?.6:1}}>{saving?'Salvando...':'Salvar KPIs do dia'}</button>
        {saved&&<span style={{fontSize:12,color:T.success,fontWeight:800}}>KPIs salvos</span>}
        {saveError&&<span style={{fontSize:12,color:T.danger,fontWeight:800}}>{saveError}</span>}
      </div>}
    </div>

    <div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:T.textSec,marginBottom:12}}>Acumulado · {campaign}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:10}}>
        {['leadsRecebidos','leadsContatados','reuniaoAgendamento','propostaEnviada'].map(k=><Card key={k} style={{padding:15}}><Label>{KPI_LABELS[k]}</Label><div style={{fontSize:26,fontWeight:900,marginTop:8}}>{accumulated[k]}</div></Card>)}
        <Card style={{padding:15}}><Label>Vendas</Label><div style={{fontSize:26,fontWeight:900,marginTop:8}}>{accumulatedSales.length}</div></Card>
      </div>
    </div>

    <div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:T.textSec,marginBottom:12}}>Faturamento do mês · {monthLabel}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10}}>
        <Card><Label>Faturamento do mês</Label><div style={{fontSize:25,fontWeight:900,marginTop:9,color:T.success}}>{brl(monthRevenue)}</div></Card>
        <Card><Label>Vendas no mês</Label><div style={{fontSize:28,fontWeight:900,marginTop:9}}>{monthSales.length}</div></Card>
        <Card><Label>Ticket médio</Label><div style={{fontSize:25,fontWeight:900,marginTop:9}}>{brl(monthTicket)}</div></Card>
      </div>
    </div>

    <div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:T.textSec,marginBottom:12}}>Resultado de hoje · aba Vendas</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10}}>
        <Card><Label>Vendas hoje</Label><div style={{fontSize:28,fontWeight:900,marginTop:9}}>{salesDay.length}</div></Card>
        <Card><Label>Faturamento hoje</Label><div style={{fontSize:25,fontWeight:900,marginTop:9,color:T.success}}>{brl(revenueDay)}</div></Card>
        <Card><Label>Ticket médio hoje</Label><div style={{fontSize:25,fontWeight:900,marginTop:9}}>{brl(ticketDay)}</div></Card>
      </div>
    </div>

    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:T.textSec}}>Relatório diário de KPIs</div>
        <button onClick={()=>setShowReport(v=>!v)} style={{background:T.accent,color:'#08111B',border:0,borderRadius:8,padding:'9px 13px',fontWeight:900,cursor:'pointer'}}>{showReport?'Ocultar relatório':'Gerar relatório'}</button>
      </div>
      {showReport&&<Card>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><button onClick={copy} style={{background:copied?T.success:T.accent,color:'#08111B',border:0,borderRadius:8,padding:'8px 12px',fontWeight:900,cursor:'pointer'}}>{copied?'Copiado!':'Copiar para WhatsApp'}</button></div>
        <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:12,lineHeight:1.55,color:T.textSec,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:14,margin:0}}>{report}</pre>
      </Card>}
    </div>

    <div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:T.textSec,marginBottom:12}}>Evolução do mês · {campaign}</div>
      <Card style={{padding:'18px 10px 8px'}}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartRows}>
            <CartesianGrid stroke={T.border} vertical={false}/>
            <XAxis dataKey="name" tick={{fill:T.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:T.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={28}/>
            <Tooltip contentStyle={{background:T.overlay,border:`1px solid ${T.borderMid}`,borderRadius:8}}/>
            <Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="recebidos" name="Leads recebidos" fill={T.kpi.leadsNovos} radius={[3,3,0,0]}/>
            <Bar dataKey="contatados" name="Contatados" fill={T.kpi.abordagem} radius={[3,3,0,0]}/>
            <Bar dataKey="reunioes" name="Reuniões" fill={T.kpi.fup} radius={[3,3,0,0]}/>
            <Bar dataKey="vendas" name="Vendas" fill={T.success} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  </div>;
}
