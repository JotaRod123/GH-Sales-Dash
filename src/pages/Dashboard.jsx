import { useState } from 'react';
import { useKpis, useTeamKpis } from '../hooks/useKpis';
import { useKpisProspeccao, useTeamKpisProspeccao } from '../hooks/useKpisProspeccao';
import { useProspects, useTeamProspects } from '../hooks/useProspects';
import { useVendas, useTeamVendas } from '../hooks/useVendas';
import TabVisaoGeral from '../components/TabVisaoGeral';
import TabProspeccao from '../components/TabProspeccao';
import TabCRM from '../components/TabCRM';
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

  const canSeeTeam = isAdmin || isEspectador;
  const teamKpisHook = useTeamKpis(canSeeTeam);
  const teamKpisProspHook = useTeamKpisProspeccao(canSeeTeam);
  const teamProspectsHook = useTeamProspects(canSeeTeam);
  const teamVendasHook = useTeamVendas(canSeeTeam);

  const NAV = [
    { key: 'visao', label: 'Visão Geral' },
    { key: 'prospeccao', label: 'Prospecção' },
    { key: 'crm', label: 'CRM' },
    { key: 'relatorios', label: 'Relatórios' },
  ];

  const getDisplay = () => {
    if (viewMode === 'mine') {
      return {
        kpis: ownKpis.kpis,
        kpisProsp: ownKpisProsp.kpis,
        prospects: ownProspects.prospects,
        vendas: ownVendas.vendas,
        readOnly: false,
        label: profile.nome,
      };
    }
    if (viewMode === 'team') {
      return {
        kpis: teamKpisHook.teamKpis,
        kpisProsp: teamKpisProspHook.teamKpis,
        prospects: teamProspectsHook.teamProspects,
        vendas: teamVendasHook.teamVendas,
        readOnly: true,
        label: 'Consolidado da equipe',
      };
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

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <header style={{
        height: 52, borderBottom: '1px solid ' + T.border, background: T.surface,
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 24,
        position: 'sticky', top: 0, zIndex: 200, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg, #C8A84B 0%, #8A6F2A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#0D1208',
          }}>GH</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Sales</span>
        </div>

        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map((n) => {
            const active = tab === n.key;
            return (
              <button key={n.key} onClick={() => setTab(n.key)} style={{
                background: 'transparent', border: 'none', borderRadius: 5,
                color: active ? T.text : T.textSec, cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400,
                padding: '5px 11px', position: 'relative', fontFamily: 'inherit',
              }}>
                {n.label}
                {active && (
                  <span style={{
                    position: 'absolute', bottom: -1, left: '50%',
                    transform: 'translateX(-50%)', width: '60%',
                    height: 2, background: T.accent, borderRadius: 1,
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {canSeeTeam && (
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              background: T.bg, border: '1px solid ' + T.border, borderRadius: 6,
              color: T.text, fontSize: 12, padding: '5px 10px',
              outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {isAdmin && <option value="mine">Meus dados</option>}
            <option value="team">Consolidado da equipe</option>
            {teamKpisHook.admins.map((a) => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: T.textMuted, fontSize: 11 }}>{formatDateBR(today())}</span>
          <span style={{ color: T.textSec, fontSize: 12 }}>{profile.nome}</span>
          <button onClick={onSignOut} style={{
            background: 'transparent', border: '1px solid ' + T.border,
            borderRadius: 6, color: T.textSec, fontSize: 12,
            padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit',
          }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 1380, margin: '0 auto', padding: '36px 28px' }}>
        {tab === 'visao' && (
          <TabVisaoGeral
            kpis={display.kpis}
            vendas={display.vendas}
            readOnly={display.readOnly}
            viewLabel={display.label}
            saveDay={ownKpis.saveDay}
          />
        )}
        {tab === 'prospeccao' && (
          <TabProspeccao
            kpisProsp={display.kpisProsp}
            prospects={display.prospects}
            readOnly={display.readOnly}
            viewLabel={display.label}
            saveDay={ownKpisProsp.saveDay}
            addProspect={ownProspects.addProspect}
            updateProspect={ownProspects.updateProspect}
            deleteProspect={ownProspects.deleteProspect}
            addVenda={ownVendas.addVenda}
            refetchVendas={ownVendas.refetch}
          />
        )}
        {tab === 'crm' && (
          <TabCRM
            vendas={display.vendas}
            readOnly={display.readOnly}
            viewLabel={display.label}
            addVenda={ownVendas.addVenda}
            updateVenda={ownVendas.updateVenda}
            deleteVenda={ownVendas.deleteVenda}
          />
        )}
        {tab === 'relatorios' && (
          <TabRelatorios
            kpis={display.kpis}
            kpisProsp={display.kpisProsp}
            vendas={display.vendas}
            viewLabel={display.label}
            isAdmin={isAdmin}
            isTeamView={viewMode === 'team'}
            admins={teamKpisHook.admins}
            teamKpis={teamKpisHook.teamKpis}
            teamKpisProsp={teamKpisProspHook.teamKpis}
            teamVendas={teamVendasHook.teamVendas}
          />
        )}
      </main>
    </div>
  );
}
