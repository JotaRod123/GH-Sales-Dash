import { useMemo, useState } from 'react';
import TabCRM from './TabCRM';
import { T } from '../lib/theme';
import { calcularComissao } from '../lib/comissoes';

const brl = v => Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
};
const todayLocal = () => {
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const monthTitle = ym => new Date(ym+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
const dateBR = iso => iso ? String(iso).slice(0,10).split('-').reverse().join('/') : '—';

export default function TabCRMComComissao(props) {
  const { vendas = [], readOnly = false, updateVenda, loadingVendas = false, loadErrorVendas = '', retryVendas } = props;
  const [selectedMonth,setSelectedMonth] = useState(currentMonth);
  const [showFuture,setShowFuture] = useState(false);
  const [futureError,setFutureError] = useState('');
  const [updatingId,setUpdatingId] = useState(null);

  const months = useMemo(() => [...new Set([
    currentMonth(),
    ...vendas.map(v=>String(v.data_venda||v.dataVenda||'').slice(0,7)).filter(x=>/^\d{4}-\d{2}$/.test(x))
  ])].sort().reverse(),[vendas]);

  const vendasPeriodo = useMemo(() => selectedMonth === 'todos'
    ? vendas
    : vendas.filter(v=>String(v.data_venda||v.dataVenda||'').slice(0,7)===selectedMonth),
  [vendas,selectedMonth]);

  const futureSales = useMemo(() => vendas.map(v=>({...v,detalhes:calcularComissao(v)}))
    .filter(v=>v.detalhes.parcelada && v.detalhes.vencimento)
    .sort((a,b)=>a.detalhes.vencimento.localeCompare(b.detalhes.vencimento)),[vendas]);
  const futurePending = futureSales.filter(v=>!v.comissao_futura_recebida_em);
  const futurePendingAmount = futurePending.reduce((s,v)=>s+v.detalhes.futura,0);
  const futurosRecebidosPeriodo = futureSales.filter(v=>v.comissao_futura_recebida_em && (selectedMonth==='todos'||String(v.comissao_futura_recebida_em).slice(0,7)===selectedMonth));

  const resumo = useMemo(() => {
    const comissaoImediata=vendasPeriodo.reduce((s,v)=>s+calcularComissao(v).imediata,0);
    const faturamento=vendasPeriodo.reduce((s,v)=>s+Number(v.valor||0),0);
    const comissaoAcumulada=vendas.reduce((s,v)=>s+calcularComissao(v).total,0);
    const recebidas=futurosRecebidosPeriodo.reduce((s,v)=>s+v.detalhes.futura,0);
    return {comissaoImediata,faturamento,comissaoAcumulada,recebidas};
  },[vendas,vendasPeriodo,futurosRecebidosPeriodo]);

  const cards=[
    ['Parcela imediata',brl(resumo.comissaoImediata),'Comissão inicial prevista das vendas do período'],
    ['Parcelas futuras recebidas',brl(resumo.recebidas),'Confirmadas como recebidas no período selecionado'],
    ['Faturamento do período',brl(resumo.faturamento),'Vendas registradas no período'],
    ...(selectedMonth==='todos'?[['Comissão acumulada geral',brl(resumo.comissaoAcumulada),'Total de todos os meses, inclusive parcelas futuras']]:[])
  ];

  const togglePaid=async v => {
    if (readOnly || !updateVenda || updatingId) return;
    const nextDate=v.comissao_futura_recebida_em ? null : todayLocal();
    setUpdatingId(v.id);setFutureError('');
    try {
      const result=await updateVenda(v.id,{comissao_futura_recebida_em:nextDate});
      if(result?.error)throw new Error(result.error.message||'Falha ao atualizar recebimento.');
    }catch(e){setFutureError(e?.message||'Não foi possível registrar o recebimento.')}
    finally{setUpdatingId(null)}
  };
  return <div style={{display:'flex',flexDirection:'column',gap:22}}>
    <div>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'end',flexWrap:'wrap',marginBottom:12}}>
        <div>
          <div style={{color:T.textSec,fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Resumo de comissões</div>
          <div style={{color:T.textMuted,fontSize:12,marginTop:5}}>Consulte cada mês ou o histórico completo. Parcelas futuras permanecem registradas após a virada do mês.</div>
        </div>
        <label style={{display:'grid',gap:5,fontSize:11,color:T.textSec}}>Mês de referência
          <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,color:T.text,padding:'10px 12px',minWidth:190}}>
            {months.map(m=><option key={m} value={m}>{monthTitle(m)}</option>)}
            <option value="todos">Todos os meses</option>
          </select>
        </label>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12}}>
        {cards.map(([label,value,sub])=><div key={label} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:'17px 18px'}}>
          <div style={{color:T.textSec,fontSize:11,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</div>
          <div style={{color:T.accent,fontSize:24,fontWeight:800,marginTop:7}}>{value}</div>
          <div style={{color:T.textMuted,fontSize:11,marginTop:4}}>{sub}</div>
        </div>)}
      </div>
      <button type="button" onClick={()=>setShowFuture(x=>!x)} style={{marginTop:13,background:T.accent,color:'#08111B',border:0,borderRadius:9,padding:'11px 15px',fontWeight:800,cursor:'pointer'}}>
        {showFuture?'Ocultar comissões futuras':'Analisar comissões futuras'} · {brl(futurePendingAmount)} pendentes
      </button>
    </div>
    {showFuture&&<div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:18,display:'grid',gap:12}}>
      <div style={{fontSize:16,fontWeight:800}}>Parcelas futuras — histórico completo</div>
      <div style={{fontSize:12,color:T.textSec}}>Todas as vendas de evento no boleto ou recorrência, mesmo de meses anteriores. Vencimento previsto seis meses após a venda. Uma parcela vencida só conta como recebida quando for confirmada.</div>
      {futureError&&<div role="alert" style={{color:T.danger}}>{futureError}</div>}
      {futureSales.length===0 ? <div style={{color:T.textMuted,fontSize:13}}>Ainda não há parcelas futuras cadastradas. Edite a forma de pagamento das vendas antigas para incluí-las.</div>:
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr>{['Cliente','Venda','Pagamento','Vencimento','Parcela futura','Situação',...(!readOnly?['Ação']:[])].map(label=><th key={label} style={{textAlign:'left',padding:'9px 10px',borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap',color:T.textSec}}>{label}</th>)}</tr></thead>
            <tbody>{futureSales.map(v=>{
              const received=Boolean(v.comissao_futura_recebida_em);
              const late=!received && v.detalhes.vencimento<todayLocal();
              return <tr key={v.id}>
                <td style={{padding:'10px',borderBottom:`1px solid ${T.border}`}}>{v.nome}</td>
                <td style={{padding:'10px',borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap'}}>{dateBR(v.data_venda)}</td>
                <td style={{padding:'10px',borderBottom:`1px solid ${T.border}`}}>{v.condicao_pagamento}</td>
                <td style={{padding:'10px',borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap'}}>{dateBR(v.detalhes.vencimento)}</td>
                <td style={{padding:'10px',borderBottom:`1px solid ${T.border}`,fontWeight:800}}>{brl(v.detalhes.futura)}</td>
                <td style={{padding:'10px',borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap',color:received?T.success:late?T.danger:T.textSec}}>{received?'Recebida em '+dateBR(v.comissao_futura_recebida_em):late?'Vencida · pendente':'A receber'}</td>
                {!readOnly&&<td style={{padding:'10px',borderBottom:`1px solid ${T.border}`}}><button type="button" disabled={Boolean(updatingId)} onClick={()=>togglePaid(v)} style={{background:T.surfaceHov,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,padding:'7px 9px',cursor:'pointer',whiteSpace:'nowrap'}}>{received?'Desfazer recebimento':'Marcar recebida'}</button></td>}
              </tr>;
            })}</tbody>
          </table>
        </div>}
    </div>}
    {loadingVendas&&<div role="status" style={{padding:13,color:T.textSec,background:T.surface,borderRadius:9}}>Carregando histórico de vendas…</div>}
    {loadErrorVendas&&<div role="alert" style={{padding:14,color:'#ff9c9c',background:T.surface,border:'1px solid #8d4444',borderRadius:9,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
      Não foi possível atualizar as vendas: {loadErrorVendas}. Os registros anteriores não foram apagados.
      {retryVendas&&<button type="button" onClick={retryVendas} style={{background:T.accent,color:'#08111B',padding:'8px 12px',border:0,borderRadius:7,fontWeight:800,cursor:'pointer'}}>Tentar novamente</button>}
    </div>}
    <TabCRM {...props} vendas={vendasPeriodo}/>
  </div>;
}
