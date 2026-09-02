import { useState } from 'react';
import { T } from '../lib/theme';

const PRODUTOS = ['Scale or Die','Monsterday','Scale Society','Blackmonster','MedMaster Plan','Health Club','Health Society','GH Master','MFA','Outros'];
const ORIGENS = ['Trafego','Evento','Prospeccao','Indicacao'];

const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDateBR = (s) => { if (!s) return ''; const p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
const today = () => new Date().toISOString().slice(0, 10);

const ORIGEM_COLORS = {
  'Trafego': T.kpi.abordagem,
  'Evento': T.kpi.fup,
  'Prospeccao': T.kpi.leadsNovos,
  'Indicacao': T.kpi.emNegociacao,
};

const validateVenda = (v) => {
  const e = {};
  if (!v.nome.trim()) e.nome = 'Obrigatorio';
  if (!v.dataVenda) e.dataVenda = 'Obrigatorio';
  if (!v.origem) e.origem = 'Obrigatorio';
  if (!v.produto || v.produto === 'Selecione') e.produto = 'Obrigatorio';
  if (v.produto === 'Outros' && !v.produtoOutros.trim()) e.produtoOutros = 'Obrigatorio';
  if (!v.valor || isNaN(parseFloat(v.valor))) e.valor = 'Valor numerico obrigatorio';
  return e;
};

const toFormShape = (row) => {
  const isProdutoLista = PRODUTOS.filter(p => p !== 'Outros').includes(row.produto);
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone || '',
    dataVenda: row.data_venda,
    origem: row.origem,
    produto: isProdutoLista ? row.produto : 'Outros',
    produtoOutros: isProdutoLista ? '' : row.produto,
    valor: String(row.valor),
    observacao: row.observacao || '',
  };
};

const EMPTY = { nome: '', telefone: '', dataVenda: today(), origem: '', produto: '', produtoOutros: '', valor: '', observacao: '' };

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
  };
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={Object.assign({ border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: small ? 12 : 13, padding: small ? '5px 12px' : '8px 18px', opacity: disabled ? 0.5 : 1, transition: 'all .15s', fontFamily: 'inherit' }, variants[variant], style)}>
      {children}
    </button>
  );
}
function Pill({ origem }) {
  const color = ORIGEM_COLORS[origem] || T.textSec;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: '1px solid ' + color + '30', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600, color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />{origem}
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
        style={{ background: T.bg, border: '1px solid ' + (error ? T.danger : focus ? T.borderMid : T.border), borderRadius: 6, color: value && value !== 'Selecione' ? T.text : T.textSec, fontSize: 13, padding: '8px 11px', outline: 'none', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>
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
function ObsCell({ texto }) {
  const [open, setOpen] = useState(false);
  if (!texto) return <span style={{ color: T.textMuted, fontStyle: 'italic' }}>-</span>;
  return (
    <div style={{ position: 'relative' }}>
      <span onClick={() => setOpen((v) => !v)} style={{ color: T.textSec, fontSize: 13, cursor: 'pointer', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
        {texto}
      </span>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.surface, border: '1px solid ' + T.borderMid, borderRadius: 12, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.8)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textSec, marginBottom: 12 }}>Observacoes</div>
            <div style={{ color: T.text, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{texto}</div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setOpen(false)} style={{ background: T.accent, color: '#0D1208', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Modal({ title, onClose, children, width = 560 }) {
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

export default function TabCRM({ vendas, readOnly, viewLabel, addVenda, updateVenda, deleteVenda }) {
  const [form, setForm] = useState(Object.assign({}, EMPTY));
  const [errors, setErrors] = useState({});
  const [editVenda, setEditVenda] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);
  const [fFrom, setFFrom] = useState('');
  const [fTo, setFTo] = useState('');
  const [fProduto, setFProduto] = useState('');
  const [fOrigem, setFOrigem] = useState('');
  const [fValorMin, setFValorMin] = useState('');
  const [saving, setSaving] = useState(false);

  const sf = (f, v) => setForm((p) => Object.assign({}, p, { [f]: v }));

  const handleAdd = async () => {
    const errs = validateVenda(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const produto = form.produto === 'Outros' ? form.produtoOutros : form.produto;
    await addVenda({ ...form, produto });
    setSaving(false);
    setForm(Object.assign({}, EMPTY));
    setErrors({});
  };

  const handleEditSave = async () => {
    const errs = validateVenda(editVenda);
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    const produto = editVenda.produto === 'Outros' ? editVenda.produtoOutros : editVenda.produto;
    await updateVenda(editVenda.id, { ...editVenda, produto });
    setEditVenda(null);
    setEditErrors({});
  };

  const shaped = vendas.map(toFormShape);
  const filtered = shaped.filter((v) => {
    if (fFrom && v.dataVenda < fFrom) return false;
    if (fTo && v.dataVenda > fTo) return false;
    if (fProduto && fProduto !== 'Todos' && v.produto !== fProduto && !(fProduto === 'Outros' && !PRODUTOS.filter(p => p !== 'Outros').includes(v.produto))) return false;
    if (fOrigem && fOrigem !== 'Todas' && v.origem !== fOrigem) return false;
    if (fValorMin && parseFloat(v.valor) < parseFloat(fValorMin)) return false;
    return true;
  });

  const totalFiltrado = filtered.reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);

  const TH = ({ children }) => (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, borderBottom: '1px solid ' + T.border, whiteSpace: 'nowrap' }}>{children}</th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {readOnly && <div style={{ color: T.accent, fontSize: 12, fontWeight: 600 }}>Visualizando: {viewLabel} · somente leitura</div>}

      {!readOnly && (
        <div>
          <div style={{ marginBottom: 14 }}><span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Nova venda</span></div>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 14, marginBottom: 14 }}>
              <Input label="Nome" value={form.nome} onChange={(v) => sf('nome', v)} error={errors.nome} placeholder="Nome do cliente" />
              <Input label="Telefone (opcional)" value={form.telefone} onChange={(v) => sf('telefone', v)} placeholder="(11) 99999-9999" />
              <Input label="Data da venda" type="date" value={form.dataVenda} onChange={(v) => sf('dataVenda', v)} error={errors.dataVenda} />
              <Select label="Origem" value={form.origem || 'Selecione'} onChange={(v) => sf('origem', v)} options={['Selecione', ...ORIGENS]} error={errors.origem} />
              <Select label="Produto" value={form.produto || 'Selecione'} onChange={(v) => sf('produto', v)} options={['Selecione', ...PRODUTOS]} error={errors.produto} />
              {form.produto === 'Outros' && <Input label="Qual produto?" value={form.produtoOutros} onChange={(v) => sf('produtoOutros', v)} error={errors.produtoOutros} placeholder="Nome do produto" />}
              <Input label="Valor (R$)" type="number" value={form.valor} onChange={(v) => sf('valor', v)} error={errors.valor} placeholder="0.00" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <Textarea label="Observacoes" value={form.observacao} onChange={(v) => sf('observacao', v)} placeholder="Detalhes adicionais sobre a venda..." />
            </div>
            <Btn onClick={handleAdd} disabled={saving}>{saving ? 'Salvando...' : 'Registrar venda'}</Btn>
          </Card>
        </div>
      )}

      <div>
        <div style={{ marginBottom: 14 }}><span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Filtros</span></div>
        <Card style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Input label="Data inicial" type="date" value={fFrom} onChange={setFFrom} style={{ minWidth: 155 }} />
            <Input label="Data final" type="date" value={fTo} onChange={setFTo} style={{ minWidth: 155 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 175 }}>
              <Label>Produto</Label>
              <select value={fProduto} onChange={(e) => setFProduto(e.target.value)} style={{ background: T.bg, border: '1px solid ' + T.border, borderRadius: 6, color: T.text, fontSize: 13, padding: '8px 11px', outline: 'none', cursor: 'pointer' }}>
                <option value="">Todos</option>
                {PRODUTOS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 155 }}>
              <Label>Origem</Label>
              <select value={fOrigem} onChange={(e) => setFOrigem(e.target.value)} style={{ background: T.bg, border: '1px solid ' + T.border, borderRadius: 6, color: T.text, fontSize: 13, padding: '8px 11px', outline: 'none', cursor: 'pointer' }}>
                <option value="">Todas</option>
                {ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <Input label="Valor minimo" type="number" value={fValorMin} onChange={setFValorMin} placeholder="R$ 0" style={{ minWidth: 130 }} />
            <button onClick={() => { setFFrom(''); setFTo(''); setFProduto(''); setFOrigem(''); setFValorMin(''); }} style={{ background: 'transparent', border: '1px solid ' + T.border, borderRadius: 6, color: T.textSec, fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 1 }}>Limpar</button>
          </div>
        </Card>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{filtered.length} venda{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.success }}>Total: {formatBRL(totalFiltrado)}</span>
        </div>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>Nenhuma venda encontrada.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr><TH>Nome</TH><TH>Telefone</TH><TH>Data</TH><TH>Origem</TH><TH>Produto</TH><TH>Valor</TH><TH>Observacoes</TH>{!readOnly && <TH></TH>}</tr></thead>
                <tbody>
                  {filtered.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid ' + T.border : 'none' }}>
                      <td style={{ padding: '11px 14px', color: T.text, fontWeight: 500 }}>{v.nome}</td>
                      <td style={{ padding: '11px 14px', color: T.textSec }}>{v.telefone || <span style={{ color: T.textMuted, fontStyle: 'italic' }}>-</span>}</td>
                      <td style={{ padding: '11px 14px', color: T.textSec, whiteSpace: 'nowrap' }}>{formatDateBR(v.dataVenda)}</td>
                      <td style={{ padding: '11px 14px' }}><Pill origem={v.origem} /></td>
                      <td style={{ padding: '11px 14px', color: T.text, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.produto === 'Outros' ? v.produtoOutros : v.produto}</td>
                      <td style={{ padding: '11px 14px', color: T.success, fontWeight: 600, whiteSpace: 'nowrap' }}>{formatBRL(v.valor)}</td>
                      <td style={{ padding: '11px 14px', maxWidth: 180 }}><ObsCell texto={v.observacao} /></td>
                      {!readOnly && (
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn small variant="ghost" onClick={() => setEditVenda(toFormShape(vendas.find(x => x.id === v.id)))}>Editar</Btn>
                            <Btn small variant="danger" onClick={() => setConfirmDel(v)}>Excluir</Btn>
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

      {editVenda && (
        <Modal title="Editar venda" onClose={() => setEditVenda(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Nome" value={editVenda.nome} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { nome: v }))} error={editErrors.nome} />
            <Input label="Telefone (opcional)" value={editVenda.telefone} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { telefone: v }))} />
            <Input label="Data da venda" type="date" value={editVenda.dataVenda} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { dataVenda: v }))} error={editErrors.dataVenda} />
            <Select label="Origem" value={editVenda.origem} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { origem: v }))} options={ORIGENS} error={editErrors.origem} />
            <Select label="Produto" value={editVenda.produto} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { produto: v }))} options={PRODUTOS} error={editErrors.produto} />
            {editVenda.produto === 'Outros' && <Input label="Qual produto?" value={editVenda.produtoOutros} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { produtoOutros: v }))} error={editErrors.produtoOutros} />}
            <Input label="Valor (R$)" type="number" value={editVenda.valor} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { valor: v }))} error={editErrors.valor} />
          </div>
          <Textarea label="Observacoes" value={editVenda.observacao} onChange={(v) => setEditVenda((p) => Object.assign({}, p, { observacao: v }))} />
          <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setEditVenda(null)}>Cancelar</Btn>
            <Btn onClick={handleEditSave}>Salvar</Btn>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Excluir venda" onClose={() => setConfirmDel(null)} width={400}>
          <p style={{ color: T.textSec, margin: '0 0 22px', fontSize: 14, lineHeight: 1.6 }}>
            Excluir a venda de <strong style={{ color: T.text }}>{confirmDel.nome}</strong>? Esta acao e irreversivel.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
            <Btn variant="danger" onClick={async () => { await deleteVenda(confirmDel.id); setConfirmDel(null); }}>Excluir</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
