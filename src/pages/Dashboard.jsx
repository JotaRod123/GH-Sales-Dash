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

const today = () => new Date().toISOString().slice(0, 10);
const formatDateBR = (s) => {
  if (!s) return '';
  const parts = s.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
};

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

  const NAV = [
    { key: 'visao', label: 'Visão Geral' },
    { key: 'prospeccao', label: 'Prospecção' },
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'calls', label: 'Calls' },
    { key: 'acoes', label: 'Próximas Ações' },
    { key: 'crm', label: 'Vendas' },
    { key: 'metas', label: 'Metas' },
    { key: 'relatorios', label: 'Relatórios' },
  ];

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
  const teamNotice = <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:24, color:T.textSec }}>Calls, próximas ações e metas são operacionais por usuário. Selecione <b style={{color:T.text}}>Meus dados</b> para editar e visualizar esses módulos.</div>;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <header style={{ borderBottom: '1px solid ' + T.border, background: T.surface, padding: '10px 22px', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #D6A72C 0%, #8A6A18 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#08131F' }}>GH</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Sales OS</span>
          </div>

          <nav style={{ display:'flex', gap:2, flexWrap:'wrap', flex:1 }}>
            {NAV.map((n) => {
              const active = tab === n.key;
              return <button key={n.key} onClick={() => setTab(n.key)} style={{ background: active ? T.surfaceHov : 'transparent', border:'none', borderRadius:6, color:active ? T.text : T.textSec, cursor:'pointer', fontSize:12, fontWeight:active?700:400, padding:'7px 10px', fontFamily:'inherit' }}>{n.label}</button>;
            })}
          </nav>

          {canSeeTeam && <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={{ background:T.bg, border:'1px solid '+T.border, borderRadius:6, color:T.text, fontSize:12, padding:'6px 9px' }}>
            {isAdmin && <option value="mine">Meus dados</option>}
            <option value="team">Consolidado da equipe</option>
            {teamKpisHook.admins.filter((a)=>a.id!==profile.id).map((a)=><option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>}

          <span style={{ color:T.textMuted, fontSize:11 }}>{formatDateBR(today())}</span>
          <button onClick={onSignOut} style={{ background:'transparent', border:'1px solid '+T.border, borderRadius:6, color:T.textSec, fontSize:12, padding:'6px 10px', cursor:'pointer' }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '30px 24px' }}>
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
  );
}
