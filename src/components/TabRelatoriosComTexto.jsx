import { useMemo, useState } from 'react';
import { T } from '../lib/theme';

const money = v => Number(v || 0).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
const num = v => Number(v || 0);
const percent = (a,b) => b > 0 ? (100*a/b).toFixed(1)+'%' : '—';
const dateOf = v => String(v?.data_venda || v?.dataVenda || '').slice(0,10);
const monthOf = s => String(s || '').slice(0,7);
const titleMonth = s => new Date(s+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
function Card({label,value,sub}) {return <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,padding:17,minWidth:0}}>
  <div style={{color:T.textSec,fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</div>
  <div style={{fontSize:25,fontWeight:900,color:T.text,marginTop:10,overflowWrap:'anywhere'}}>{value}</div>
  {sub&&<div style={{fontSize:11,color:T.textMuted,marginTop:7}}>{sub}</div>}
</div>}
const sum = (rows,key) => rows.reduce((total,row)=>total+num(row[key]),0);
const reportCopy = async text => {
  try {await navigator.clipboard.writeText(text)} catch {
    const el=document.createElement('textarea');el.value=text;document.body.appendChild(el);el.select();document.execCommand('copy');el.remove();
  }
};

export default function TabRelatoriosComTexto({campaignKpis=[],kpisProsp=[],vendas=[],viewLabel='Meus dados'}) {
  const [section,setSection]=useState('commercial');
  const [month,setMonth]=useState('');
  const [dateFrom,setDateFrom]=useState('');
  const [dateTo,setDateTo]=useState('');
  const [campaign,setCampaign]=useState('Geral');
  const [copied,setCopied]=useState(false);
  const months=useMemo(()=>[...new Set([
    ...campaignKpis.map(r=>monthOf(r.data)),...kpisProsp.map(r=>monthOf(r.data)),
    ...vendas.map(v=>monthOf(dateOf(v))),new Date().toISOString().slice(0,7)
  ].filter(Boolean))].sort().reverse(),[campaignKpis,kpisProsp,vendas]);
  const selectedMonth=months.includes(month)?month:months[0];
  const monthStart=selectedMonth+'-01';
  const monthEnd=selectedMonth+'-'+String(new Date(Number(selectedMonth.slice(0,4)),Number(selectedMonth.slice(5,7)),0).getDate()).padStart(2,'0');
  const periodFrom=dateFrom||monthStart;
  const periodTo=dateTo||monthEnd;
  const withinPeriod=d=>Boolean(d)&&d>=periodFrom&&d<=periodTo;
  const periodLabel=`${periodFrom.split('-').reverse().join('/')} a ${periodTo.split('-').reverse().join('/')}`;
  const campaigns=[...new Set(campaignKpis.map(r=>r.campanha).filter(Boolean))].sort();
  const activeCampaign=campaign==='Geral'||campaigns.includes(campaign)?campaign:'Geral';
  const cv=vendas.filter(v=>withinPeriod(dateOf(v)) && (activeCampaign==='Geral'||v.campanha===activeCampaign));
  const ck=campaignKpis.filter(r=>withinPeriod(String(r.data).slice(0,10)) && (activeCampaign==='Geral'||r.campanha===activeCampaign));
  const pk=kpisProsp.filter(r=>monthOf(r.data)===selectedMonth);
  const revenue=sum(cv,'valor'),sales=cv.length,leads=sum(ck,'leads_recebidos');
  const contacted=sum(ck,'leads_contatados'),replied=sum(ck,'em_conversa'),proposals=sum(ck,'proposta_enviada');
  const fups=sum(ck,'fups_realizados'),fupsReplied=sum(ck,'fups_respondidos');
  const conversionSales=activeCampaign==='Geral'?cv.filter(v=>campaigns.includes(v.campanha)).length:sales;
  const prospectados=sum(pk,'prospectados'),prospContacted=sum(pk,'contatados'),prospReplied=sum(pk,'responderam');
  const meetings=sum(pk,'reuniao_agendada'),converted=sum(pk,'convertido');
  const copyText=section==='commercial'
    ? `RELATÓRIO COMERCIAL — ${viewLabel}\n${periodLabel} · ${activeCampaign}\nLeads recebidos: ${leads}\nContatados: ${contacted}\nResponderam: ${replied}\nFUPs realizados: ${fups}\nFUPs respondidos: ${fupsReplied}\nPropostas: ${proposals}\nDesqualificados: ${sum(ck,'leads_desqualificados')}\nVendas: ${sales}\nFaturamento: ${money(revenue)}\nTicket médio: ${money(sales?revenue/sales:0)}\nTaxa de resposta: ${percent(replied,contacted)}\nTaxa de conversão: ${percent(conversionSales,leads)}\nFechamento sobre propostas: ${percent(conversionSales,proposals)}`
    : `RELATÓRIO DE PROSPECÇÃO — ${viewLabel}\n${periodLabel}\nProspectados: ${prospectados}\nContatados: ${prospContacted}\nResponderam: ${prospReplied}\nReuniões agendadas: ${meetings}\nConvertidos: ${converted}\nTaxa de resposta: ${percent(prospReplied,prospContacted)}\nConversão: ${percent(converted,prospectados)}`;
  const fieldStyle={background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:9,padding:'10px 12px',maxWidth:'100%'};
  const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:10};
  const rows=section==='commercial'?[
    ['Leads recebidos',leads],['Contatados',contacted],['Em conversa / responderam',replied],
    ['FUPs realizados',fups],['FUPs respondidos',fupsReplied],['Reuniões',sum(ck,'reuniao_agendamento')],
    ['Propostas enviadas',proposals],['Leads desqualificados',sum(ck,'leads_desqualificados')],
    ['Vendas',sales],['Faturamento',money(revenue)],['Ticket médio',money(sales?revenue/sales:0)],
    ['Taxa de resposta',percent(replied,contacted)],['Taxa de conversão',percent(conversionSales,leads)],
    ['Fechamento / propostas',percent(conversionSales,proposals)],['Resposta dos FUPs',percent(fupsReplied,fups)]
  ]:[
    ['Prospectados',prospectados],['Contatados',prospContacted],['Responderam',prospReplied],
    ['Reuniões agendadas',meetings],['Convertidos',converted],
    ['Taxa de resposta',percent(prospReplied,prospContacted)],['Conversão da prospecção',percent(converted,prospectados)]
  ];
  return <div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      {[['commercial','Relatório Comercial'],['prospecting','Relatório de Prospecção']].map(([key,label])=><button key={key} onClick={()=>{setSection(key);setCopied(false)}} style={{...fieldStyle,cursor:'pointer',background:section===key?T.accent:T.surface,color:section===key?'#08111B':T.text,fontWeight:800}}>{label}</button>)}
    </div>
    <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end'}}>
      <label style={{display:'grid',gap:6,color:T.textSec,fontSize:12}}>Mês de referência<select value={selectedMonth} onChange={e=>{setMonth(e.target.value);setDateFrom('');setDateTo('')}} style={fieldStyle}>{months.map(m=><option key={m} value={m}>{titleMonth(m)}</option>)}</select></label>
      <label style={{display:'grid',gap:6,color:T.textSec,fontSize:12}}>Data inicial<input type="date" value={dateFrom} max={dateTo||undefined} onChange={e=>setDateFrom(e.target.value)} style={{...fieldStyle,colorScheme:'dark'}}/></label>
      <label style={{display:'grid',gap:6,color:T.textSec,fontSize:12}}>Data final<input type="date" value={dateTo} min={dateFrom||undefined} onChange={e=>setDateTo(e.target.value)} style={{...fieldStyle,colorScheme:'dark'}}/></label>
      {(dateFrom||dateTo)&&<button onClick={()=>{setDateFrom('');setDateTo('')}} style={{...fieldStyle,cursor:'pointer'}}>Limpar datas</button>}
      {section==='commercial'&&<label style={{display:'grid',gap:6,color:T.textSec,fontSize:12}}>Campanha<select value={activeCampaign} onChange={e=>setCampaign(e.target.value)} style={fieldStyle}><option value="Geral">Geral</option>{campaigns.map(v=><option key={v} value={v}>{v}</option>)}</select></label>}
      <div style={{fontSize:12,color:T.textMuted}}>Visualizando: {viewLabel}</div>
    </div>
    <div style={grid}>{rows.map(([label,value])=><Card key={label} label={label} value={value}/>)}</div>
    <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      <button onClick={async()=>{await reportCopy(copyText);setCopied(true)}} style={{...fieldStyle,background:T.accent,color:'#08111B',fontWeight:800,cursor:'pointer'}}>{copied?'Copiado!':'Copiar relatório para WhatsApp'}</button>
      <span style={{fontSize:11,color:T.textMuted}}>Indicadores comerciais vêm dos KPIs das campanhas; vendas e faturamento vêm dos registros de Vendas. Prospecção é independente.</span>
    </div>
  </div>;
}
