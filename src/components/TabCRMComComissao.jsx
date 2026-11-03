import { useMemo, useState } from 'react';
import TabCRM from './TabCRM';
import { T } from '../lib/theme';

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
};
const monthTitle = ym => new Date(ym+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});

export default function TabCRMComComissao(props) {
  const { vendas = [] } = props;
  const [selectedMonth,setSelectedMonth] = useState(currentMonth);
  const months = useMemo(() => [...new Set([
    currentMonth(),
    ...vendas.map(v=>String(v.data_venda||v.dataVenda||'').slice(0,7)).filter(x=>/^\d{4}-\d{2}$/.test(x))
  ])].sort().reverse(),[vendas]);

  const vendasPeriodo = useMemo(() => selectedMonth === 'todos'
    ? vendas
    : vendas.filter(v=>String(v.data_venda||v.dataVenda||'').slice(0,7)===selectedMonth),
  [vendas,selectedMonth]);

  const resumo = useMemo(() => {
    const comissaoMes = vendasPeriodo.reduce((s,v)=>s+Number(v.comissao_valor||0),0);
    const comissaoTotal = vendas.reduce((s,v)=>s+Number(v.comissao_valor||0),0);
    const faturamentoMes = vendasPeriodo.reduce((s,v)=>s+Number(v.valor||0),0);
    const media = vendasPeriodo.length ? comissaoMes/vendasPeriodo.length : 0;
    return {comissaoMes,comissaoTotal,faturamentoMes,media,vendasMes:vendasPeriodo.length};
  },[vendas,vendasPeriodo]);

  const cards = [
    ['Comissão do período',brl(resumo.comissaoMes),`${resumo.vendasMes} venda${resumo.vendasMes===1?'':'s'} no período`],
    ['Faturamento do período',brl(resumo.faturamentoMes),'Vendas registradas no período'],
    ['Média de comissão por venda',brl(resumo.media),'Média do período selecionado'],
    ['Comissão acumulada geral',brl(resumo.comissaoTotal),'Histórico completo, sem apagar meses anteriores'],
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:22}}>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'end',flexWrap:'wrap',marginBottom:12}}>
          <div>
            <div style={{color:T.textSec,fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Resumo de comissões</div>
            <div style={{color:T.textMuted,fontSize:12,marginTop:5}}>Selecione um mês para consultar as vendas e a comissão. O mês atual abre automaticamente.</div>
          </div>
          <label style={{display:'grid',gap:5,fontSize:11,color:T.textSec}}>
            Mês de referência
            <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,color:T.text,padding:'10px 12px',minWidth:190}}>
              {months.map(m=><option key={m} value={m}>{monthTitle(m)}</option>)}
              <option value="todos">Todos os meses</option>
            </select>
          </label>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12}}>
          {cards.map(([label,value,sub])=>(
            <div key={label} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:'17px 18px'}}>
              <div style={{color:T.textSec,fontSize:11,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</div>
              <div style={{color:T.accent,fontSize:25,fontWeight:800,marginTop:7}}>{value}</div>
              <div style={{color:T.textMuted,fontSize:11,marginTop:4}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
      <TabCRM {...props} vendas={vendasPeriodo} />
    </div>
  );
}
