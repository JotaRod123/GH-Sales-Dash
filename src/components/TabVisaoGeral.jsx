import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { T } from '../lib/theme';

const KPI_LABELS = {
  leadsNovos: 'Leads Novos',
  abordagem: 'Abordagem',
  fup: 'FUP',
  emNegociacao: 'Em Negociacao',
  fechados: 'Fechados',
};

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Marco','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const today = () => new Date().toISOString().slice(0, 10);
const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDateBR = (s) => { if (!s) return ''; const p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };

const startOfWeek = (date) => {
  const d = new Date(date);
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};
const endOfWeek = (date) => {
  const s = new Date(startOfWeek(date));
  s.setDate(s.getDate() + 6);
  return s.toISOString().slice(0, 10);
};
const daysInRange = (start, end) => {
  const days = [], cur = new Date(start), last = new Date(end);
  while (cur <= last) { days.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
  return days;
};
const weeksOfMonth = (year, month) => {
  const weeks = [];
  let cur = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  while (cur <= last) {
    const wStart = cur.toISOString().slice(0, 10);
    const wEnd = new Date(Math.min(new Date(endOfWeek(cur)).getTime(), last.getTime())).toISOString().slice(0, 10);
    weeks.push({ start: wStart, end: wEnd });
    cur = new Date(new Date(wEnd).getTime() + 86400000);
  }
  return weeks;
};

const normalizeKpi = (row) => ({
  date: row.data,
  leadsNovos: row.leads_novos || 0,
  abordagem: row.abordagem || 0,
  fup: row.fup || 0,
  emNegociacao: row.em_negociacao || 0,
  fechados: row.fechados || 0,
});

function Card({ children, style = {} }) {
  return <div style={Object.assign({ background: T.surface, border: '1px solid ' + T.border, borderRadius: 10, padding: '20px 24px' }, style)}>{children}</div>;
}
function Label({ children, color, style = {} }) {
  return <div style={Object.assign({ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: color || T.textSec }, style)}>{children}</div>;
}
function Btn({ children, onClick, style = {}, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={Object.assign({ border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, padding: '8px 18px', background: hov ? '#B8943B' : T.accent, color: '#0D1208', opacity: disabled ? 0.5 : 1, transition: 'all .15s', fontFamily: 'inherit' }, style)}>
      {children}
    </button>
  );
}
function Toggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: T.bg, borderRadius: 7, padding: 3, gap: 2, border: '1px solid ' + T.border }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{ background: active ? T.surface : 'transparent', color: active ? T.text : T.textSec, border: active ? '1px solid ' + T.border : '1px solid transparent', borderRadius: 5, padding: '4px 13px', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
function Section({ title, action, children, style = {} }) {
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 14 }, style)}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: T.overlay, border: '1px solid ' + T.borderMid, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,.6)' }}>
      <div style={{ color: T.textSec, fontSize: 11, marginBottom: 7, fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: T.textSec, fontSize: 12 }}>{p.name}</span>
          <span style={{ color: T.text, fontSize: 12, fontWeight: 600, marginLeft: 'auto', paddingLeft: 12 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}
function KpiCard({ kpiKey, value, onChange, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value));
  const inputRef = useRef();
  const color = T.kpi[kpiKey];
  useEffect(() => setLocal(String(value)), [value]);
  const commit = () => { setEditing(false); onChange(kpiKey, parseInt(local) || 0); };
  return (
    <div style={{ background: T.surface, border: '1px solid ' + T.border, borderTop: '2px solid ' + color, borderRadius: 10, padding: '18px 20px', flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <Label color={T.textSec}>{KPI_LABELS[kpiKey]}</Label>
      </div>
      <div onClick={() => { if (!readOnly) { setEditing(true); setTimeout(() => inputRef.current && inputRef.current.select(), 40); } }}>
        {editing && !readOnly ? (
          <input ref={inputRef} type="number" min={0} value={local}
            onChange={(e) => { setLocal(e.target.value); onChange(kpiKey, parseInt(e.target.value) || 0); }}
            onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()}
            style={{ background: 'transparent', border: 'none', borderBottom: '1.5px solid ' + color, color: T.text, fontSize: 30, fontWeight: 700, width: '100%', outline: 'none', padding: '0 0 2px', fontFamily: 'inherit' }} />
        ) : (
          <div style={{ fontSize: 30, fontWeight: 700, color: T.text, cursor: readOnly ? 'default' : 'text', lineHeight: 1.1 }}>{value}</div>
        )}
      </div>
    </div>
  );
}
function MetricTile({ label, value, sub, color }) {
  return (
    <Card style={{ flex: 1 }}>
      <Label style={{ marginBottom: 8 }}>{label}</Label>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || T.text, marginBottom: sub ? 4 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.textMuted }}>{sub}</div>}
    </Card>
  );
}

export default function TabVisaoGeral({ kpis, vendas, readOnly, viewLabel, saveDay }) {
  const normalizedKpis = kpis.map(normalizeKpi);
  const todayStr = today();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const todayAgg = normalizedKpis.filter((k) => k.date === selectedDate).reduce(
    (a, k) => ({ leadsNovos: a.leadsNovos + k.leadsNovos, abordagem: a.abordagem + k.abordagem, fup: a.fup + k.fup, emNegociacao: a.emNegociacao + k.emNegociacao, fechados: a.fechados + k.fechados }),
    { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
  );

  const [current, setCurrent] = useState(todayAgg);
  useEffect(() => { setCurrent(todayAgg); }, [readOnly, viewLabel, selectedDate, JSON.stringify(todayAgg)]);

  const displayValues = readOnly ? todayAgg : current;
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('semanal');
  const [linePeriod, setLinePeriod] = useState('semanal');
  const now = new Date();

  const handleChange = (k, v) => setCurrent((p) => Object.assign({}, p, { [k]: v }));
  const handleSave = async () => {
    setSaving(true);
    await saveDay(current, selectedDate);
    setSaving(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const aggregate = (rows) => rows.reduce(
    (a, k) => ({ leadsNovos: a.leadsNovos + k.leadsNovos, abordagem: a.abordagem + k.abordagem, fup: a.fup + k.fup, emNegociacao: a.emNegociacao + k.emNegociacao, fechados: a.fechados + k.fechados }),
    { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
  );

  const mStart = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
  const fatMes = vendas.filter((v) => v.data_venda >= mStart && v.data_venda <= todayStr).reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);
  const totalVendasMes = vendas.filter((v) => v.data_venda >= mStart && v.data_venda <= todayStr).length;
  const ticketMedio = totalVendasMes > 0 ? fatMes / totalVendasMes : 0;

  const buildChart = (period) => {
    if (period === 'semanal') {
      const sw = startOfWeek(now), ew = endOfWeek(now);
      return daysInRange(sw, ew).map((d) => Object.assign({ name: formatDateBR(d).slice(0, 5) }, aggregate(normalizedKpis.filter((x) => x.date === d))));
    }
    return weeksOfMonth(now.getFullYear(), now.getMonth()).map((w, i) =>
      Object.assign({ name: 'Sem ' + (i + 1) }, aggregate(normalizedKpis.filter((k) => k.date >= w.start && k.date <= w.end)))
    );
  };

  const barData = buildChart(chartPeriod);
  const lineData = buildChart(linePeriod);
  const mKpis = normalizedKpis.filter((k) => k.date >= mStart && k.date <= todayStr);
  const pieAgg = aggregate(mKpis);
  const pieTotal = Object.values(pieAgg).reduce((s, v) => s + v, 0);
  const pieData = Object.entries(pieAgg).map(([k, v]) => ({ name: KPI_LABELS[k], value: v, color: T.kpi[k], pct: pieTotal > 0 ? ((v / pieTotal) * 100).toFixed(1) : '0.0' }));
  const isToday = selectedDate === todayStr;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {readOnly && <div style={{ color: T.accent, fontSize: 12, fontWeight: 600 }}>Visualizando: {viewLabel} · somente leitura</div>}

      <Section title={'KPIs · ' + formatDateBR(selectedDate)} action={
        !readOnly ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Label>Data:</Label>
            <input type="date" value={selectedDate} max={todayStr} onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: T.bg, border: '1px solid ' + T.border, borderRadius: 6, color: T.text, fontSize: 13, padding: '5px 8px', outline: 'none', minHeight: 34, colorScheme: 'dark', WebkitAppearance: 'none' }} />
            {!isToday && <button onClick={() => setSelectedDate(todayStr)} style={{ background: 'transparent', border: '1px solid ' + T.border, borderRadius: 6, color: T.textSec, fontSize: 12, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Hoje</button>}
          </div>
        ) : null
      }>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.keys(KPI_LABELS).map((k) => <KpiCard key={k} kpiKey={k} value={displayValues[k]} onChange={handleChange} readOnly={readOnly} />)}
        </div>
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : isToday ? 'Salvar dia' : 'Salvar ' + formatDateBR(selectedDate)}</Btn>
            {toast && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: T.success, fontSize: 12, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />KPIs salvos</div>}
          </div>
        )}
      </Section>

      <Section title="Faturamento">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <MetricTile label="Faturamento do mes" value={formatBRL(fatMes)} sub={MONTH_NAMES[now.getMonth()] + ' ' + now.getFullYear() + ' · soma do CRM'} color={T.success} />
          <MetricTile label="Total de vendas" value={totalVendasMes} sub="registros no CRM este mes" color={T.kpi.leadsNovos} />
          <MetricTile label="Ticket medio" value={formatBRL(ticketMedio)} sub="media por venda este mes" color={T.kpi.abordagem} />
        </div>
      </Section>

      <Section title="Volume por periodo" action={<Toggle options={[{ value: 'semanal', label: 'Semana' }, { value: 'mensal', label: 'Mes' }]} value={chartPeriod} onChange={setChartPeriod} />}>
        <Card style={{ padding: '20px 16px 8px' }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={3} barCategoryGap="30%">
              <CartesianGrid stroke={T.border} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11, color: T.textSec }} iconType="circle" iconSize={6} />
              {Object.entries(KPI_LABELS).map(([k, label]) => <Bar key={k} dataKey={k} name={label} fill={T.kpi[k]} radius={[3, 3, 0, 0]} maxBarSize={18} />)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
        <Section title={'Distribuicao · ' + MONTH_NAMES[now.getMonth()]}>
          <Card style={{ padding: '16px 8px' }}>
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const d = payload[0].payload;
                  return <div style={{ background: T.overlay, border: '1px solid ' + T.borderMid, borderRadius: 8, padding: '8px 12px' }}><div style={{ color: d.color, fontWeight: 700, fontSize: 12 }}>{d.name}</div><div style={{ color: T.textSec, fontSize: 12 }}>{d.value} · {d.pct}%</div></div>;
                }} />
                <Legend wrapperStyle={{ fontSize: 11, color: T.textSec }} iconType="circle" iconSize={6} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Section>

        <Section title="Evolucao de performance" action={<Toggle options={[{ value: 'semanal', label: 'Semana' }, { value: 'mensal', label: 'Mes' }]} value={linePeriod} onChange={setLinePeriod} />}>
          <Card style={{ padding: '20px 16px 8px' }}>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={lineData}>
                <CartesianGrid stroke={T.border} strokeDasharray="0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11, color: T.textSec }} iconType="circle" iconSize={6} />
                {Object.entries(KPI_LABELS).map(([k, label]) => <Line key={k} type="monotone" dataKey={k} name={label} stroke={T.kpi[k]} strokeWidth={1.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />)}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Section>
      </div>
    </div>
  );
}
