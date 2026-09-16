import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import TabVisaoGeral from './TabVisaoGeral';
import { T } from '../lib/theme';

const formatBRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function TabVisaoGeralComComissao(props) {
  const { vendas = [] } = props;
  const [target, setTarget] = useState(null);

  const comissaoMes = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return vendas
      .filter((v) => String(v.data_venda || '').startsWith(ym))
      .reduce((total, v) => total + Number(v.comissao_valor || 0), 0);
  }, [vendas]);

  useEffect(() => {
    let cancelled = false;
    const findTarget = () => {
      if (cancelled) return;
      const labels = Array.from(document.querySelectorAll('span'));
      const title = labels.find((el) => (el.textContent || '').trim().toLowerCase() === 'faturamento');
      const section = title?.parentElement?.parentElement;
      const cardsRow = section?.children?.[1];
      if (cardsRow instanceof HTMLElement) {
        setTarget(cardsRow);
        return;
      }
      requestAnimationFrame(findTarget);
    };
    requestAnimationFrame(findTarget);
    return () => { cancelled = true; };
  }, []);

  const commissionCard = target ? createPortal(
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:`2px solid ${T.accent}`, borderRadius:10, padding:'20px 24px', flex:1, minWidth:190 }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:T.textSec, marginBottom:8 }}>Comissão do mês</div>
      <div style={{ fontSize:26, fontWeight:800, color:T.accent }}>{formatBRL(comissaoMes)}</div>
      <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>calculada pelas vendas registradas no mês</div>
    </div>,
    target
  ) : null;

  return <>
    <TabVisaoGeral {...props} />
    {commissionCard}
  </>;
}
