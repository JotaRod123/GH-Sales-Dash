import { useState } from 'react';
import { useKpis, useTeamKpis } from '../hooks/useKpis';
import { useKpisProspeccao, useTeamKpisProspeccao } from '../hooks/useKpisProspeccao';
import { useProspects, useTeamProspects } from '../hooks/useProspects';
import { useVendas, useTeamVendas } from '../hooks/useVendas';
import { useSalesOS } from '../hooks/useSalesOS';
import TabVisaoGeral from '../components/TabVisaoGeral';
import TabProspeccao from '../components/TabProspeccao';
import TabPipeline from '../components/TabPipeline';
import TabCalls from '../components/TabCalls';
import TabAcoes from '../components/TabAcoes';
import TabCRM from '../components/TabCRM';
import TabMetas from '../components/TabMetas';
import TabRelatorios from '../components/TabRelatorios';
import { T } from '../lib/theme';

const NAV = [
  { key: 'visao', label: 'Dashboard' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'prospeccao', label: 'Prospecção' },
  { key: 'calls', label: 'Calls' },
  { key: 'acoes', label: 'Próximas Ações' },
  { key: 'crm', label: 'Vendas' },
  { key: 'relatorios', label: 'Relatórios' },
  { key: 'metas', label: 'Metas' },
];

export default function Dashboard({ profile, isAdmin, isEspectador, onSignOut }) {
  const [tab, setTab] = useState('visao');
  const [viewMode, setViewMode] = useState(isEspectador ? 'team' : 'mine');

  const ownKpis = useKpis(profile.id);
  const ownKpisProsp = useKpisProspeccao(profile.id);
  const ownProspects = useProspects(profile.id);
  const ownVendas = useVendas(profile.id);
  const salesOS = useSalesOS(profile.id);

  const canSeeTeam = isAdmin || isEspectador;
  const teamKpisHook = useTeamKpis(canSeeTeam);
  const teamKpisProspHook = useTeamKpisProspeccao(canSeeTeam);
  const teamProspectsHook = useTeamProspects(canSeeTeam);
  const teamVendasHook = useTeamVendas(canSeeTeam);

  const getDisplay = () => {
    if (viewMode === 'mine') {
      return { kpis: ownKpis.kpis, kpisProsp: ownKpisProsp.kpis, prospects: ownProspects.prospects, vendas: ownVendas.vendas, readOnly: false, label: profile.nome };
    }
    if (viewMode === 'team') {
      return { kpis: teamKpisHook.teamKpis, kpisProsp: teamKpisProspHook.teamKpis, prospects: teamProspectsHook.teamProspects, vendas: teamVendasHook.teamVendas, readOnly: true, label: 'Consolidado da equipe' };
    }
    const admin = teamKpisHook.admins.find((a) => a.id === viewMode);
    return {
      kpis: teamKpisHook.teamKpis.filter((k) => k.user_id === viewMode),
      kpisProsp: teamKpisProspHook.teamKpis.filter((k) => k.user_id === viewMode),
      prospects: teamProspectsHook.teamProspects.filter((p) => p.user_id === viewMode),
      vendas: teamVendasHook.teamVendas.filter((v) => v.user_id === viewMode),
      readOnly: true,
      label: admin ? admin.nome : 'Admin',
    };
  };

  const display = getDisplay();
  const ownModule = viewMode === 'mine';
  const currentLabel = NAV.find((n) => n.key === tab)?.label || 'Dashboard';
  const teamNotice = <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:24, color:T.textSec }}>Calls, próximas ações e metas são operacionais por usuário. Selecione <b style={{color:T.text}}>Meus dados</b> para editar e visualizar esses módulos.</div>;

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        .gh-shell{display:grid;grid-template-columns:230px minmax(0,1fr);min-height:100vh}
        .gh-sidebar{position:sticky;top:0;height:100vh;background:#08111B;border-right:1px solid ${T.border};padding:18px 12px;display:flex;flex-direction:column}
        .gh-nav{display:flex;flex-direction:column;gap:4px}
        .gh-main{padding:22px 24px 34px;min-width:0}
        .gh-topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}
        .gh-mobile-nav{display:none}
        @media(max-width:900px){
          .gh-shell{display:block}.gh-sidebar{position:relative;height:auto;border-right:0;border-bottom:1px solid ${T.border};padding:12px}.gh-nav{display:none}.gh-mobile-nav{display:flex;gap:6px;overflow:auto;padding-top:10px}.gh-main{padding:16px}.gh-topbar{align-items:flex-start;flex-direction:column}
        }
      `}</style>
      <div className="gh-shell">
        <aside className="gh-sidebar">
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'4px 8px 20px'}}>
            <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#F0C75E,#A87F17)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#08111B',fontSize:12}}>GH</div>
            <div><div style={{fontSize:15,fontWeight:800}}>Sales <span style={{color:T.accent}}>OS</span></div><div style={{fontSize:10,color:T.textMuted,marginTop:2}}>Closer Command Center</div></div>
          </div>

          <nav className="gh-nav">
            {NAV.map((n)=>{
              const active=tab===n.key;
              return <button key={n.key} onClick={()=>setTab(n.key)} style={{width:'100%',textAlign:'left',border:active?`1px solid ${T.borderMid}`:'1px solid transparent',background:active?T.surfaceHov:'transparent',color:active?T.text:T.textSec,borderRadius:10,padding:'11px 12px',cursor:'pointer',fontSize:13,fontWeight:active?700:500}}>{n.label}</button>;
            })}
          </nav>

          <div className="gh-mobile-nav">
            {NAV.map((n)=>{
              const active=tab===n.key;
              return <button key={n.key} onClick={()=>setTab(n.key)} style={{whiteSpace:'nowrap',border:`1px solid ${active?T.borderMid:T.border}`,background:active?T.surfaceHov:'transparent',color:active?T.text:T.textSec,borderRadius:9,padding:'8px 10px',fontSize:12}}>{n.label}</button>;
            })}
          </div>

          <div style={{marginTop:'auto',padding:'16px 8px 6px',borderTop:`1px solid ${T.border}`}}>
            <div style={{fontSize:11,color:T.textMuted}}>Logado como</div>
            <div style={{fontSize:13,fontWeight:700,marginTop:3}}>{profile.nome}</div>
            <button onClick={onSignOut} style={{marginTop:10,width:'100%',background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,color:T.textSec,padding:'8px 10px',cursor:'pointer'}}>Sair</button>
          </div>
        </aside>

        <main className="gh-main">
          <div className="gh-topbar">
            <div>
              <div style={{fontSize:11,color:T.textMuted,textTransform:'uppercase',letterSpacing:'.08em'}}>GH Sales OS</div>
              <h1 style={{fontSize:26,margin:'4px 0 0',lineHeight:1.1}}>{currentLabel}</h1>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {canSeeTeam && <select value={viewMode} onChange={(e)=>setViewMode(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,color:T.text,padding:'9px 10px',fontSize:12}}>
                {isAdmin && <option value="mine">Meus dados</option>}
                <option value="team">Consolidado da equipe</option>
                {teamKpisHook.admins.filter((a)=>a.id!==profile.id).map((a)=><option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>}
            </div>
          </div>

          {tab === 'visao' && <TabVisaoGeral kpis={display.kpis} vendas={display.vendas} readOnly={display.readOnly} viewLabel={display.label} saveDay={ownKpis.saveDay} />}
          {tab === 'prospeccao' && <TabProspeccao kpisProsp={display.kpisProsp} prospects={display.prospects} readOnly={display.readOnly} viewLabel={display.label} saveDay={ownKpisProsp.saveDay} addProspect={ownProspects.addProspect} updateProspect={ownProspects.updateProspect} deleteProspect={ownProspects.deleteProspect} addVenda={ownVendas.addVenda} refetchVendas={ownVendas.refetch} />}
          {tab === 'pipeline' && <TabPipeline prospects={display.prospects} readOnly={display.readOnly} updateProspect={ownProspects.updateProspect} />}
          {tab === 'calls' && (ownModule ? <TabCalls calls={salesOS.calls} readOnly={false} addCall={salesOS.addCall} updateCall={salesOS.updateCall} deleteCall={salesOS.deleteCall} /> : teamNotice)}
          {tab === 'acoes' && (ownModule ? <TabAcoes acoes={salesOS.acoes} readOnly={false} addAcao={salesOS.addAcao} updateAcao={salesOS.updateAcao} deleteAcao={salesOS.deleteAcao} /> : teamNotice)}
          {tab === 'crm' && <TabCRM vendas={display.vendas} readOnly={display.readOnly} viewLabel={display.label} addVenda={ownVendas.addVenda} updateVenda={ownVendas.updateVenda} deleteVenda={ownVendas.deleteVenda} />}
          {tab === 'metas' && (ownModule ? <TabMetas metas={salesOS.metas} vendas={ownVendas.vendas} calls={salesOS.calls} kpisProsp={ownKpisProsp.kpis} readOnly={false} upsertMeta={salesOS.upsertMeta} /> : teamNotice)}
          {tab === 'relatorios' && <TabRelatorios kpis={display.kpis} kpisProsp={display.kpisProsp} vendas={display.vendas} viewLabel={display.label} isAdmin={isAdmin} isTeamView={viewMode === 'team'} admins={teamKpisHook.admins} teamKpis={teamKpisHook.teamKpis} teamKpisProsp={teamKpisProspHook.teamKpis} teamVendas={teamVendasHook.teamVendas} />}
        </main>
      </div>
    </div>
  );
}
