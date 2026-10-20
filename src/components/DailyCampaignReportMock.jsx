import { useMemo, useState } from 'react';
import { T } from '../lib/theme';

const formatDateBR = (s) => {
  if (!s) return '';
  const [y,m,d] = String(s).slice(0,10).split('-');
  return `${d}/${m}`;
};

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function DailyCampaignReportMock({ vendas = [] }) {
  const [campaign, setCampaign] = useState('MonsterDay');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [copied, setCopied] = useState(false);

  const data = useMemo(() => {
    const d = new Date(date + 'T12:00:00');
    const yday = new Date(d);
    yday.setDate(yday.getDate() - 1);
    const yesterday = yday.toISOString().slice(0,10);

    const todaySales = vendas.filter(v => String(v.data_venda || v.dataVenda || '').slice(0,10) === date && String(v.produto || '').toLowerCase() === campaign.toLowerCase());
    const revenue = todaySales.reduce((s,v)=>s+Number(v.valor||0),0);

    return {
      yesterday,
      yesterdayLeads: 12,
      todayLeads: 12,
      accumulated: 24,
      contacted: 9,
      waiting: 5,
      talking: 3,
      meetings: 1,
      proposals: 0,
      purchases: todaySales.length,
      noInterest: 0,
      wrongNumber: 3,
      testNumber: 1,
      noContact: 3,
      sales: todaySales.length,
      revenue,
    };
  }, [campaign, date, vendas]);

  const report = useMemo(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const upper = campaign.toUpperCase();
    return `📊 VOLUMETRIA DE LEADS – ${upper}

🕣 Horário da atualização: ${hh}:${mm}

📅 Ontem – ${formatDateBR(data.yesterday)}
• ${campaign}: ${data.yesterdayLeads} leads

📅 Hoje – ${formatDateBR(date)} (até agora)
• ${campaign}: ${data.todayLeads} leads

📈 Total acumulado da campanha: ${data.accumulated}

————————————————————————————————

🎯 PERFORMANCE COMERCIAL – ${upper}

📅 Hoje – ${formatDateBR(date)}

• Leads recebidos: ${data.todayLeads}
• Leads contatados: ${data.contacted}
• Aguardando resposta: ${data.waiting}
• Em conversa: ${data.talking}
• Reunião/agendamento: ${data.meetings}
• Proposta/oferta enviada: ${data.proposals}
• Compras realizadas: ${data.purchases}
• Sem interesse: ${data.noInterest}
• Número cadastrado errado: ${data.wrongNumber}
• Número de teste: ${data.testNumber}
• Sem contato realizado: ${data.noContact}

💰 Resultado
• Vendas: ${data.sales}
• Faturamento: ${brl(data.revenue)}

————————————————————————————————`;
  }, [campaign, date, data]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(()=>setCopied(false),1800);
    } catch {}
  };

  const Card = ({ children, style = {} }) => <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:18,...style}}>{children}</div>;
  const Label = ({ children }) => <div style={{fontSize:10,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:T.textSec}}>{children}</div>;
  const Metric = ({ label, value, sub, accent }) => <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:14}}>
    <Label>{label}</Label>
    <div style={{fontSize:25,fontWeight:900,color:accent?T.accent:T.text,marginTop:8}}>{value}</div>
    <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{sub}</div>
  </div>;

  const statuses = [
    ['Leads recebidos',data.todayLeads],['Leads contatados',data.contacted],['Aguardando resposta',data.waiting],
    ['Em conversa',data.talking],['Reunião/agendamento',data.meetings],['Proposta/oferta enviada',data.proposals],
    ['Compras realizadas',data.purchases],['Sem interesse',data.noInterest],['Número cadastrado errado',data.wrongNumber],
    ['Número de teste',data.testNumber],['Sem contato realizado',data.noContact],
  ];

  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:'.09em',textTransform:'uppercase',color:T.textSec}}>Relatório diário de campanha</div>
      <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Prévia visual isolada. Nesta primeira versão, os status ainda são demonstrativos.</div>
    </div>

    <Card>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,alignItems:'end'}}>
        <div>
          <Label>Campanha</Label>
          <select value={campaign} onChange={e=>setCampaign(e.target.value)} style={{width:'100%',marginTop:6,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,padding:'10px 11px'}}>
            <option>MonsterDay</option><option>Scale or Die</option><option>MedMaster Plan</option>
          </select>
        </div>
        <div>
          <Label>Data do relatório</Label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%',marginTop:6,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,padding:'9px 11px',colorScheme:'dark'}}/>
        </div>
        <button onClick={copy} style={{background:T.accent,color:'#08111B',border:0,borderRadius:8,padding:'11px 14px',fontWeight:900,cursor:'pointer'}}>{copied?'Copiado!':'Copiar para WhatsApp'}</button>
      </div>
    </Card>

    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.15fr) minmax(340px,.85fr)',gap:16}}>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <Card>
          <Label>Volumetria</Label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10,marginTop:12}}>
            <Metric label="Ontem" value={data.yesterdayLeads} sub={`leads em ${formatDateBR(data.yesterday)}`}/>
            <Metric label="Hoje" value={data.todayLeads} sub={`leads em ${formatDateBR(date)}`}/>
            <Metric label="Acumulado" value={data.accumulated} sub={campaign} accent/>
          </div>
        </Card>

        <Card>
          <Label>Performance comercial · hoje</Label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:10,marginTop:12}}>
            {statuses.map(([label,value])=><div key={label} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:13,minHeight:88}}>
              <div style={{fontSize:22,fontWeight:900}}>{value}</div>
              <div style={{fontSize:11,color:T.textSec,marginTop:5,lineHeight:1.25}}>{label}</div>
            </div>)}
            <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:13,minHeight:88}}>
              <div style={{fontSize:22,fontWeight:900,color:T.success}}>{brl(data.revenue)}</div>
              <div style={{fontSize:11,color:T.textSec,marginTop:5}}>Faturamento hoje</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:12}}>
          <div>
            <div style={{fontSize:15,fontWeight:800}}>Prévia para WhatsApp</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:3}}>Formato final para sua supervisora.</div>
          </div>
          <button onClick={copy} style={{background:T.accent,color:'#08111B',border:0,borderRadius:8,padding:'8px 11px',fontWeight:900,cursor:'pointer'}}>{copied?'Copiado!':'Copiar'}</button>
        </div>
        <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:12,lineHeight:1.55,color:T.textSec,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:14,margin:0,minHeight:535}}>{report}</pre>
      </Card>
    </div>
  </div>;
}
