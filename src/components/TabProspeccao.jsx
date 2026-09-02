import { useState } from 'react';
import { T } from '../lib/theme';

const PROSP_LABELS = {
  prospectados: 'Prospectados',
  contatados: 'Contatados',
  responderam: 'Responderam',
  reuniaoAgendada: 'Reuniao agendada',
  convertido: 'Convertido',
};

const STATUS_OPTS = ['Contatado', 'Respondeu', 'Reuniao agendada', 'Convertido', 'Perdido'];
const PRODUTOS = ['Scale or Die','Monsterday','Scale Society','Blackmonster','MedMaster Plan','Health Club','Health Society','GH Master','MFA','Outros'];
const ORIGENS = ['Trafego','Evento','Prospeccao','Indicacao'];

const today = () => new Date().toISOString().slice(0, 10);
const formatDateBR = (s) => { if (!s) return ''; const p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };

const STATUS_COLORS = {
  'Contatado': T.prosp.contatados,
  'Respondeu': T.prosp.responderam,
  'Reuniao agendada': T.prosp.reuniao,
  'Convertido': T.success,
  'Perdido': T.danger,
};

const normalizeProsp = (row) => ({
  date: row.data,
  prospectados: row.prospectados || 0,
  contatados: row.contatados || 0,
  responderam: row.responderam || 0,
  reuniaoAgendada: row.reuniao_agendada || 0,
  convertido: row.convertido || 0,
});

function Card({ children, style = {} }) {
  return <div style={Object.assign({ background: T.surface, border: '1px solid ' + T.border, borderRadius: 10, padding: '20px 24px' }, style)}>{children}</div>;
}
function Label({ children, style = {} }) {
  return <div style={Object.assign({ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.textSec }, style)}>{children}</div>;
}
function Btn({ children, onClick, variant = 'primary', style = {}, small = false, disabled = false }) {
  const [hov, setHov] = useState(false);
  const variants = {
    primary: { background: hov ? '#B8943B' : T.accent, color: '#0D1208' },
    danger: { background: hov ? '#ff6b6b' : T.danger, color: '#fff' },
    ghost: { background: 'transparent', color: hov ? T.text : T.textSec, border: '1px solid ' + (hov ? T.borderMid : T.border) },
    success: { background: hov ? '#5aa84c' : T.success, color: '#fff' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={Object.assign({ border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: small ? 12 : 13, padding: small ? '5px 12px' : '8px 18px', opacity: disabled ? 0.5 : 1, transition: 'all .15s', fontFamily: 'inherit' }, variants[variant], style)}>
      {children}
    </button>
  );
}
function Pill({ status }) {
  const color = STATUS_COLORS[status] || T.textSec;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: '1px solid ' + color + '30', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600, color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />{status}
    </span>
  );
}
function Input({ label, value, onChange, type = 'text', placeholder = '', error = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  const isDate = type === 'date';
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 5 }, style)}>
      {label && <Label>{label}</Label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ background: T.bg, border: '1px solid ' + (error ? T.danger : focus ? T.borderMid : T.border), borderRadius: 6, color: T.text, fontSize: 13, padding: isDate ? '8px 8px' : '8px 11px', outline: 'none', width: '100%', minHeight: 36, boxSizing: 'border-box', colorScheme: 'dark', WebkitAppearance: isDate ? 'none' : undefined }} />
      {error && <span style={{ color: T.danger, fontSize: 11 }}>{error}</span>}
    </div>
  );
}
function Select({ label, value, onChange, options, error = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 5 }, style)}>
      {label && <Label>{label}</Label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ background: T.bg, border: '1px solid ' + (error ? T.danger : focus ? T.borderMid : T.border), borderRadius: 6, color: value ? T.text : T.textSec, fontSize: 13, padding: '8px 11px', outline: 'none', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>
        {options.map((o) => <option key={o} value={o} style={{ background: T.surface }}>{o}</option>)}
      </select>
      {error && <span style={{ color: T.danger, fontSize: 11 }}>{error}</span>}
    </div>
  );
}
function Textarea({ label, value, onChange, placeholder = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 5 }, style)}>
      {label && <Label>{label}</Label>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} rows={3}
        style={{ background: T.bg, border: '1px solid ' + (focus ? T.borderMid : T.border), borderRadius: 6, color: T.text, fontSize: 13, padding: '8px 11px', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', colorScheme: 'dark' }} />
    </div>
  );
}
function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: T.surface, border: '1px solid ' + T.borderMid, borderRadius: 12, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ color: T.text, fontSize: 16, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid ' + T.border, color: T.textSec, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '1px 8px', borderRadius: 6 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function KpiProspCard({ kpiKey, value, onChange, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value));
  const color = T.prosp[kpiKey] || T.accent;
  useState(() => setLocal(String(value)), [value]);
  const commit = () => { setEditing(false); onChange(kpiKey, parseInt(local) || 0); };
  return (
    <div style={{ background: T.surface, border: '1px solid ' + T.border, borderTop: '2px solid ' + color, borderRadius: 10, padding: '18px 20px', flex: 1, minWidth: 130, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <Label>{PROSP_LABELS[kpiKey]}</Label>
      </div>
      <div onClick={() => { if (!readOnly) { setEditing(true); } }}>
        {editing && !readOnly ? (
          <input type="number" min={0} value={local}
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

const EMPTY_PROSP = { nome: '', contato: '', status: 'Contatado', observacao: '' };
const EMPTY_VENDA = { nome: '', telefone: '', dataVenda: today(), origem: 'Prospeccao', produto: 'Selecione', produtoOutros: '', valor: '', observacao: '' };

export default function TabProspeccao({ kpisProsp, prospects, readOnly, viewLabel, saveDay, addProspect, updateProspect, deleteProspect, addVenda, refetchVendas }) {
  const normalizedKpis = kpisProsp.map(normalizeProsp);
  const todayStr = today();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const todayAgg = normalizedKpis.filter((k) => k.date === selectedDate).reduce(
    (a, k) => ({ prospectados: a.prospectados + k.prospectados, contatados: a.contatados + k.contatados, responderam: a.responderam + k.responderam, reuniaoAgendada: a.reuniaoAgendada + k.reuniaoAgendada, convertido: a.convertido + k.convertido }),
    { prospectados: 0, contatados: 0, responderam: 0, reuniaoAgendada: 0, convertido: 0 }
  );

  const [current, setCurrent] = useState(todayAgg);
  useState(() => { setCurrent(todayAgg); }, [readOnly, viewLabel, selectedDate, JSON.stringify(todayAgg)]);
  const displayValues = readOnly ? todayAgg : current;

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [form, setForm] = useState(Object.assign({}, EMPTY_PROSP));
  const [editProsp, setEditProsp] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [convertProsp, setConvertProsp] = useState(null);
  const [vendaForm, setVendaForm] = useState(Object.assign({}, EMPTY_VENDA));
  const [fStatus, setFStatus] = useState('');
  const [fFrom, setFFrom] = useState('');
  const [fTo, setFTo] = useState('');
  const [savingVenda, setSavingVenda] = useState(false);

  const handleChange = (k, v) => setCurrent((p) => Object.assign({}, p, { [k]: v }));
  const handleSave = async () => {
    setSaving(true);
    await saveDay(current, selectedDate);
    setSaving(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleAddProsp = async () => {
    if (!form.nome.trim() || !form.contato.trim()) return;
    await addProspect(form);
    setForm(Object.assign({}, EMPTY_PROSP));
  };

  const handleEditSave = async () => {
    if (!editProsp.nome.trim() || !editProsp.contato.trim()) return;
    await updateProspect(editProsp.id, editProsp);
    setEditProsp(null);
  };

  const handleConvert = async () => {
    const produto = vendaForm.produto === 'Outros' ? vendaForm.produtoOutros : vendaForm.produto;
    if (!produto || produto === 'Selecione' || !vendaForm.valor || isNaN(parseFloat(vendaForm.valor))) return;
    const dataVenda = vendaForm.dataVenda
      ? new Date(vendaForm.dataVenda).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    setSavingVenda(true);
    const { error } = await addVenda({ ...vendaForm, produto, dataVenda, prospectId: convertProsp.id });
    if (!error) {
      await updateProspect(convertProsp.id, { ...convertProsp, status: 'Convertido' });
      if (refetchVendas) await refetchVendas();
      setConvertProsp(null);
      setVendaForm(Object.assign({}, EMPTY_VENDA));
    }
    setSavingVenda(false);
  };

  const now = new Date();
  const mStart = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
  const mKpis = normalizedKpis.filter((k) => k.date >= mStart && k.date <= todayStr);
  const mAgg = mKpis.reduce(
    (a, k) => ({ prospectados: a.prospectados + k.prospectados, contatados: a.contatados + k.contatados, responderam: a.responderam + k.responderam, reuniaoAgendada: a.reuniaoAgendada + k.reuniaoAgendada, convertido: a.convertido + k.convertido }),
    { prospectados: 0, contatados: 0, responderam: 0, reuniaoAgendada: 0, convertido: 0 }
  );

  const funil = [
    { label: 'Prospectados', val: mAgg.prospectados, color: T.prosp.prospectados },
    { label: 'Contatados', val: mAgg.contatados, color: T.prosp.contatados },
    { label: 'Responderam', val: mAgg.responderam, color: T.prosp.responderam },
    { label: 'Reuniao agendada', val: mAgg.reuniaoAgendada, color: T.prosp.reuniao },
    { label: 'Convertido', val: mAgg.convertido, color: T.prosp.convertido },
  ];
  const maxFunil = mAgg.prospectados || 1;

  const filtered = prospects.filter((p) => {
    if (fStatus && p.status !== fStatus) return false;
    const d = p.created_at ? p.created_at.slice(0, 10) : '';
    if (fFrom && d < fFrom) return false;
    if (fTo && d > fTo) return false;
    return true;
  });

  const isToday = selectedDate === todayStr;
  const sf = (f, v) => setForm((p) => Object.assign({}, p, { [f]: v }));
  const svf = (f, v) => setVendaForm((p) => Object.assign({}, p, { [f]: v }));

  const TH = ({ children }) => (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, borderBottom: '1px solid ' + T.border, whiteSpace: 'nowrap' }}>{children}</th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {readOnly && <div style={{ color: T.accent, fontSize: 12, fontWeight: 600 }}>Visualizando: {viewLabel} · somente leitura</div>}

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>KPIs de prospeccao · {formatDateBR(selectedDate)}</span>
          {!readOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Label>Data:</Label>
              <input type="date" value={selectedDate} max={todayStr} onChange={(e) => setSelectedDate(e.target.value)}
                style={{ background: T.bg, border: '1px solid ' + T.border, borderRadius: 6, color: T.text, fontSize: 13, padding: '5px 8px', outline: 'none', minHeight: 34, colorScheme: 'dark', WebkitAppearance: 'none' }} />
              {!isToday && <button onClick={() => setSelectedDate(todayStr)} style={{ background: 'transparent', border: '1px solid ' + T.border, borderRadius: 6, color: T.textSec, fontSize: 12, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Hoje</button>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.keys(PROSP_LABELS).map((k) => <KpiProspCard key={k} kpiKey={k} value={displayValues[k]} onChange={handleChange} readOnly={readOnly} />)}
        </div>
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : isToday ? 'Salvar dia' : 'Salvar ' + formatDateBR(selectedDate)}</Btn>
            {toast && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: T.success, fontSize: 12, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />KPIs salvos</div>}
          </div>
        )}
      </div>

      <div>
        <div style={{ marginBottom: 14 }}><span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Funil de prospeccao · mês atual</span></div>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {funil.map((f) => {
              const pct = maxFunil > 0 ? (f.val / maxFunil) * 100 : 0;
              return (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: T.textSec, width: 150, flexShrink: 0 }}>{f.label}</span>
                  <div style={{ flex: 1, height: 28, background: T.bg, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: Math.max(pct, 0) + '%', height: '100%', background: f.color, borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 10px', transition: 'width .4s ease' }}>
                      {f.val > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#0D1208' }}>{f.val}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: T.textMuted, width: 40, textAlign: 'right', flexShrink: 0 }}>{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {!readOnly && (
        <div>
          <div style={{ marginBottom: 14 }}><span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Novo prospect</span></div>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 14, marginBottom: 14 }}>
              <Input label="Nome" value={form.nome} onChange={(v) => sf('nome', v)} placeholder="Nome do prospect" />
              <Input label="Contato (tel/insta)" value={form.contato} onChange={(v) => sf('contato', v)} placeholder="@usuario ou (11) 99999" />
              <Select label="Status" value={form.status} onChange={(v) => sf('status', v)} options={STATUS_OPTS} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <Textarea label="Observacoes" value={form.observacao} onChange={(v) => sf('observacao', v)} placeholder="Contexto do prospect..." />
            </div>
            <Btn onClick={handleAddProsp}>Adicionar prospect</Btn>
          </Card>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{filtered.length} prospect{filtered.length !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Label>Status</Label>
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ background: T.bg, border: '1px solid ' + T.border, borderRadius: 6, color: T.text, fontSize: 12, padding: '5px 10px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="">Todos</option>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: T.textSec }}>De</span>
              <input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} style={{ background: T.bg, border: '1px solid ' + T.border, borderRadius: 6, color: T.text, fontSize: 12, padding: '5px 8px', outline: 'none', colorScheme: 'dark', minHeight: 32 }} />
              <span style={{ fontSize: 11, color: T.textSec }}>ate</span>
              <input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} style={{ background: T.bg, border: '1px solid ' + T.border, borderRadius: 6, color: T.text, fontSize: 12, padding: '5px 8px', outline: 'none', colorScheme: 'dark', minHeight: 32 }} />
            </div>
            <button onClick={() => { setFStatus(''); setFFrom(''); setFTo(''); }} style={{ background: 'transparent', border: '1px solid ' + T.border, borderRadius: 6, color: T.textSec, fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>Limpar</button>
          </div>
        </div>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>Nenhum prospect encontrado.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr><TH>Nome</TH><TH>Contato</TH><TH>Status</TH><TH>Observacoes</TH>{!readOnly && <TH></TH>}</tr></thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid ' + T.border : 'none' }}>
                      <td style={{ padding: '11px 14px', color: T.text, fontWeight: 500 }}>{p.nome}</td>
                      <td style={{ padding: '11px 14px', color: T.textSec }}>{p.contato}</td>
                      <td style={{ padding: '11px 14px' }}><Pill status={p.status} /></td>
                      <td style={{ padding: '11px 14px', color: T.textSec, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.observacao || <span style={{ color: T.textMuted, fontStyle: 'italic' }}>-</span>}</td>
                      {!readOnly && (
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn small variant="ghost" onClick={() => setEditProsp(Object.assign({}, p))}>Editar</Btn>
                            {p.status !== 'Convertido' && <Btn small variant="success" onClick={() => { setConvertProsp(p); setVendaForm(Object.assign({}, EMPTY_VENDA, { nome: p.nome })); }}>Converter</Btn>}
                            <Btn small variant="danger" onClick={() => setConfirmDel(p)}>Excluir</Btn>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {editProsp && (
        <Modal title="Editar prospect" onClose={() => setEditProsp(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Nome" value={editProsp.nome} onChange={(v) => setEditProsp((p) => Object.assign({}, p, { nome: v }))} />
            <Input label="Contato" value={editProsp.contato} onChange={(v) => setEditProsp((p) => Object.assign({}, p, { contato: v }))} />
            <Select label="Status" value={editProsp.status} onChange={(v) => setEditProsp((p) => Object.assign({}, p, { status: v }))} options={STATUS_OPTS} />
          </div>
          <Textarea label="Observacoes" value={editProsp.observacao} onChange={(v) => setEditProsp((p) => Object.assign({}, p, { observacao: v }))} />
          <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setEditProsp(null)}>Cancelar</Btn>
            <Btn onClick={handleEditSave}>Salvar</Btn>
          </div>
        </Modal>
      )}

      {convertProsp && (
        <Modal title={'Converter em venda - ' + convertProsp.nome} onClose={() => setConvertProsp(null)}>
          <p style={{ color: T.textSec, fontSize: 13, marginBottom: 20 }}>Preencha os dados da venda para registrar no CRM automaticamente.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Telefone (opcional)" value={vendaForm.telefone} onChange={(v) => svf('telefone', v)} placeholder="(11) 99999-9999" />
            <Input label="Data da venda" type="date" value={vendaForm.dataVenda} onChange={(v) => svf('dataVenda', v)} />
            <Select label="Origem" value={vendaForm.origem} onChange={(v) => svf('origem', v)} options={ORIGENS} />
            <Select label="Produto" value={vendaForm.produto} onChange={(v) => svf('produto', v)} options={['Selecione', ...PRODUTOS]} />
            {vendaForm.produto === 'Outros' && <Input label="Qual produto?" value={vendaForm.produtoOutros} onChange={(v) => svf('produtoOutros', v)} placeholder="Nome do produto" />}
            <Input label="Valor (R$)" type="number" value={vendaForm.valor} onChange={(v) => svf('valor', v)} placeholder="0.00" />
          </div>
          <Textarea label="Observacoes" value={vendaForm.observacao} onChange={(v) => svf('observacao', v)} placeholder="Detalhes da venda..." />
          <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setConvertProsp(null)}>Cancelar</Btn>
            <Btn variant="success" onClick={handleConvert} disabled={savingVenda}>{savingVenda ? 'Registrando...' : 'Registrar no CRM'}</Btn>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Excluir prospect" onClose={() => setConfirmDel(null)} width={400}>
          <p style={{ color: T.textSec, margin: '0 0 22px', fontSize: 14, lineHeight: 1.6 }}>
            Excluir <strong style={{ color: T.text }}>{confirmDel.nome}</strong>? Esta acao e irreversivel.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
            <Btn variant="danger" onClick={async () => { await deleteProspect(confirmDel.id); setConfirmDel(null); }}>Excluir</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
