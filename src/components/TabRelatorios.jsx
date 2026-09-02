import { useState } from 'react';
import { T } from '../lib/theme';

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Marco','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const KPI_DOT = {
  leadsNovos: T.kpi.leadsNovos,
  abordagem: T.kpi.abordagem,
  fup: T.kpi.fup,
  emNegociacao: T.kpi.emNegociacao,
  fechados: T.kpi.fechados,
};

const PROSP_DOT = {
  prospectados: T.prosp.prospectados,
  contatados: T.prosp.contatados,
  responderam: T.prosp.responderam,
  reuniaoAgendada: T.prosp.reuniao,
  convertido: T.prosp.convertido,
};

function Card({ children, style = {} }) {
  return <div style={Object.assign({ background: T.surface, border: '1px solid ' + T.border, borderRadius: 10, padding: '20px 24px' }, style)}>{children}</div>;
}
function Label({ children, style = {} }) {
  return <div style={Object.assign({ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.textSec }, style)}>{children}</div>;
}
function Section({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{title}</span>
        {subtitle && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function MonthReport({ report, vendas }) {
  const { leadsNovos, abordagem, fup, emNegociacao, fechados, prospectados, contatados, responderam, reuniaoAgendada, convertido, month, year } = report;

  const fat = vendas.reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);
  const totalVendas = vendas.length;
  const ticketMedio = totalVendas > 0 ? fat / totalVendas : 0;
  const convProsp = prospectados > 0 ? (convertido / prospectados) * 100 : 0;

  const kpiRows = [
    { key: 'leadsNovos', n: leadsNovos, label: 'Leads novos', color: KPI_DOT.leadsNovos },
    { key: 'abordagem', n: abordagem, label: 'Abordagens', color: KPI_DOT.abordagem },
    { key: 'fup', n: fup, label: 'FUPs realizados', color: KPI_DOT.fup },
    { key: 'emNegociacao', n: emNegociacao, label: 'Em negociacao', color: KPI_DOT.emNegociacao },
    { key: 'fechados', n: fechados, label: 'Vendas fechadas (KPI)', color: KPI_DOT.fechados },
  ];
  const prospRows = [
    { key: 'prospectados', n: prospectados, label: 'Prospectados', color: PROSP_DOT.prospectados },
    { key: 'contatados', n: contatados, label: 'Contatados', color: PROSP_DOT.contatados },
    { key: 'responderam', n: responderam, label: 'Responderam', color: PROSP_DOT.responderam },
    { key: 'reuniaoAgendada', n: reuniaoAgendada, label: 'Reuniao agendada', color: PROSP_DOT.reuniaoAgendada },
    { key: 'convertido', n: convertido, label: 'Convertidos', color: PROSP_DOT.convertido },
  ];

  return (
    <Card>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 22 }}>{MONTH_NAMES[parseInt(month) - 1]} {year}</div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>KPIs Comerciais</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
        {kpiRows.map((r, i) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < kpiRows.length - 1 ? '1px solid ' + T.border : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              <span style={{ color: T.textSec, fontSize: 13 }}>{r.label}</span>
            </div>
            <span style={{ color: T.text, fontWeight: 700, fontSize: 18 }}>{r.n}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>KPIs Prospeccao</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
        {prospRows.map((r, i) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < prospRows.length - 1 ? '1px solid ' + T.border : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              <span style={{ color: T.textSec, fontSize: 13 }}>{r.label}</span>
            </div>
            <span style={{ color: T.text, fontWeight: 700, fontSize: 18 }}>{r.n}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Faturamento', value: formatBRL(fat), sub: totalVendas + ' vendas no CRM', color: T.success },
          { label: 'Ticket medio', value: formatBRL(ticketMedio), sub: 'media por venda', color: T.kpi.abordagem },
          { label: 'Conv. Prospeccao', value: convProsp.toFixed(1) + '%', sub: convertido + ' de ' + prospectados + ' prospectados', color: T.prosp.convertido },
        ].map((m) => (
          <div key={m.label} style={{ background: m.color + '10', border: '1px solid ' + m.color + '20', borderRadius: 8, padding: '12px 14px' }}>
            <Label style={{ marginBottom: 6 }}>{m.label}</Label>
            <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
            {m.sub && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 3 }}>{m.sub}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function GeralReport({ kpis, kpisProsp, vendas, admins }) {
  const aggKpi = kpis.reduce(
    (a, k) => ({ leadsNovos: a.leadsNovos + (k.leads_novos || 0), abordagem: a.abordagem + (k.abordagem || 0), fup: a.fup + (k.fup || 0), emNegociacao: a.emNegociacao + (k.em_negociacao || 0), fechados: a.fechados + (k.fechados || 0) }),
    { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
  );
  const aggProsp = kpisProsp.reduce(
    (a, k) => ({ prospectados: a.prospectados + (k.prospectados || 0), contatados: a.contatados + (k.contatados || 0), responderam: a.responderam + (k.responderam || 0), reuniaoAgendada: a.reuniaoAgendada + (k.reuniao_agendada || 0), convertido: a.convertido + (k.convertido || 0) }),
    { prospectados: 0, contatados: 0, responderam: 0, reuniaoAgendada: 0, convertido: 0 }
  );

  const fatTotal = vendas.reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);
  const totalVendas = vendas.length;
  const ticketMedio = totalVendas > 0 ? fatTotal / totalVendas : 0;
  const convProsp = aggProsp.prospectados > 0 ? (aggProsp.convertido / aggProsp.prospectados) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 20 }}>Totais acumulados — toda a equipe</div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>KPIs Comerciais</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
          {[
            { key: 'leadsNovos', n: aggKpi.leadsNovos, label: 'Leads novos', color: KPI_DOT.leadsNovos },
            { key: 'abordagem', n: aggKpi.abordagem, label: 'Abordagens', color: KPI_DOT.abordagem },
            { key: 'fup', n: aggKpi.fup, label: 'FUPs', color: KPI_DOT.fup },
            { key: 'emNegociacao', n: aggKpi.emNegociacao, label: 'Em negociacao', color: KPI_DOT.emNegociacao },
            { key: 'fechados', n: aggKpi.fechados, label: 'Fechados (KPI)', color: KPI_DOT.fechados },
          ].map((r, i, arr) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + T.border : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ color: T.textSec, fontSize: 13 }}>{r.label}</span>
              </div>
              <span style={{ color: T.text, fontWeight: 700, fontSize: 18 }}>{r.n}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>KPIs Prospeccao</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
          {[
            { key: 'prospectados', n: aggProsp.prospectados, label: 'Prospectados', color: PROSP_DOT.prospectados },
            { key: 'contatados', n: aggProsp.contatados, label: 'Contatados', color: PROSP_DOT.contatados },
            { key: 'responderam', n: aggProsp.responderam, label: 'Responderam', color: PROSP_DOT.responderam },
            { key: 'reuniaoAgendada', n: aggProsp.reuniaoAgendada, label: 'Reuniao agendada', color: PROSP_DOT.reuniaoAgendada },
            { key: 'convertido', n: aggProsp.convertido, label: 'Convertidos', color: PROSP_DOT.convertido },
          ].map((r, i, arr) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + T.border : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ color: T.textSec, fontSize: 13 }}>{r.label}</span>
              </div>
              <span style={{ color: T.text, fontWeight: 700, fontSize: 18 }}>{r.n}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Faturamento total', value: formatBRL(fatTotal), sub: totalVendas + ' vendas no CRM', color: T.success },
            { label: 'Ticket medio', value: formatBRL(ticketMedio), sub: 'media por venda', color: T.kpi.abordagem },
            { label: 'Conv. Prospeccao', value: convProsp.toFixed(1) + '%', sub: aggProsp.convertido + ' de ' + aggProsp.prospectados, color: T.prosp.convertido },
          ].map((m) => (
            <div key={m.label} style={{ background: m.color + '10', border: '1px solid ' + m.color + '20', borderRadius: 8, padding: '12px 14px' }}>
              <Label style={{ marginBottom: 6 }}>{m.label}</Label>
              <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
              {m.sub && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 3 }}>{m.sub}</div>}
            </div>
          ))}
        </div>
      </Card>

      {admins && admins.length > 0 && (
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 20 }}>Por vendedor</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {admins.map((a) => {
              const aVendas = vendas.filter((v) => v.user_id === a.id);
              const aFat = aVendas.reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);
              const aKpisProsp = kpisProsp.filter((k) => k.user_id === a.id);
              const aProsp = aKpisProsp.reduce((s, k) => s + (k.prospectados || 0), 0);
              const aConv = aKpisProsp.reduce((s, k) => s + (k.convertido || 0), 0);
              const aConvPct = aProsp > 0 ? (aConv / aProsp) * 100 : 0;
              return (
                <div key={a.id} style={{ border: '1px solid ' + T.border, borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>{a.nome}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Prospectados', value: aProsp, color: T.prosp.prospectados },
                      { label: 'Convertidos', value: aConv, color: T.prosp.convertido },
                      { label: 'Conv. %', value: aConvPct.toFixed(1) + '%', color: T.kpi.leadsNovos },
                      { label: 'Faturamento', value: formatBRL(aFat), color: T.success },
                    ].map((item) => (
                      <div key={item.label} style={{ background: T.bg, borderRadius: 6, padding: '10px 12px' }}>
                        <Label style={{ marginBottom: 4 }}>{item.label}</Label>
                        <div style={{ color: item.color, fontSize: 15, fontWeight: 700 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function TabRelatorios({ kpis, kpisProsp, vendas, viewLabel, isAdmin, isTeamView, admins, teamKpis, teamKpisProsp, teamVendas }) {
  const [aba, setAba] = useState('mensal');
  const [selected, setSelected] = useState(null);

  const monthMap = {};
  kpis.forEach((k) => {
    const mk = k.data.slice(0, 7);
    if (!monthMap[mk]) monthMap[mk] = [];
    monthMap[mk].push(k);
  });
  const months = Object.keys(monthMap).sort().reverse();

  const getReport = (mk) => {
    const parts = mk.split('-');
    const y = parts[0], m = parts[1];
    const mStart = y + '-' + m + '-01';
    const mEnd = new Date(parseInt(y), parseInt(m), 0).toISOString().slice(0, 10);

    const agg = (monthMap[mk] || []).reduce(
      (a, k) => ({ leadsNovos: a.leadsNovos + (k.leads_novos || 0), abordagem: a.abordagem + (k.abordagem || 0), fup: a.fup + (k.fup || 0), emNegociacao: a.emNegociacao + (k.em_negociacao || 0), fechados: a.fechados + (k.fechados || 0) }),
      { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
    );

    const mKpisProsp = kpisProsp.filter((k) => k.data >= mStart && k.data <= mEnd);
    const aggProsp = mKpisProsp.reduce(
      (a, k) => ({ prospectados: a.prospectados + (k.prospectados || 0), contatados: a.contatados + (k.contatados || 0), responderam: a.responderam + (k.responderam || 0), reuniaoAgendada: a.reuniaoAgendada + (k.reuniao_agendada || 0), convertido: a.convertido + (k.convertido || 0) }),
      { prospectados: 0, contatados: 0, responderam: 0, reuniaoAgendada: 0, convertido: 0 }
    );

    const mVendas = vendas.filter((v) => v.data_venda >= mStart && v.data_venda <= mEnd);
    return Object.assign({}, agg, aggProsp, { month: m, year: y, mVendas });
  };

  const showGeral = isAdmin && isTeamView;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setAba('mensal')} style={{ background: aba === 'mensal' ? T.accentDim : 'transparent', border: '1px solid ' + (aba === 'mensal' ? T.accent + '50' : T.border), borderRadius: 7, padding: '8px 18px', color: aba === 'mensal' ? T.accent : T.textSec, fontSize: 13, fontWeight: aba === 'mensal' ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
          Historico Mensal
        </button>
        {showGeral && (
          <button onClick={() => setAba('geral')} style={{ background: aba === 'geral' ? T.accentDim : 'transparent', border: '1px solid ' + (aba === 'geral' ? T.accent + '50' : T.border), borderRadius: 7, padding: '8px 18px', color: aba === 'geral' ? T.accent : T.textSec, fontSize: 13, fontWeight: aba === 'geral' ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
            Geral
          </button>
        )}
      </div>

      {aba === 'mensal' && (
        <Section title="Historico mensal" subtitle={viewLabel ? ('Visualizando: ' + viewLabel) : undefined}>
          {months.length === 0 ? (
            <Card><div style={{ padding: '48px 0', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>Nenhum dado ainda. Registre os KPIs diarios na aba Visao Geral.</div></Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {months.map((mk) => {
                  const parts = mk.split('-');
                  const y = parts[0], m = parts[1];
                  const active = selected === mk;
                  return (
                    <button key={mk} onClick={() => setSelected(mk)} style={{ background: active ? T.accentDim : 'transparent', border: '1px solid ' + (active ? T.accent + '50' : T.border), borderRadius: 7, padding: '9px 14px', color: active ? T.accent : T.textSec, fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                      {MONTH_NAMES[parseInt(m) - 1]} {y}
                    </button>
                  );
                })}
              </div>
              <div>
                {selected ? (
                  <MonthReport report={getReport(selected)} vendas={getReport(selected).mVendas} />
                ) : (
                  <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                    <div style={{ color: T.textMuted, fontSize: 13 }}>Selecione um mes</div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Section>
      )}

      {aba === 'geral' && showGeral && (
        <Section title="Geral" subtitle="Soma acumulada de todos os periodos — toda a equipe">
          <GeralReport kpis={teamKpis || []} kpisProsp={teamKpisProsp || []} vendas={teamVendas || []} admins={admins || []} />
        </Section>
      )}
    </div>
  );
}
