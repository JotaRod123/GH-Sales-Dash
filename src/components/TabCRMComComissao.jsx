import { useMemo } from 'react';
import TabCRM from './TabCRM';
import { T } from '../lib/theme';

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function TabCRMComComissao(props) {
  const { vendas = [] } = props;

  const resumo = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const vendasMes = vendas.filter((v) => String(v.data_venda || v.dataVenda || '').startsWith(ym));
    const comissaoMes = vendasMes.reduce((s, v) => s + Number(v.comissao_valor || 0), 0);
    const comissaoTotal = vendas.reduce((s, v) => s + Number(v.comissao_valor || 0), 0);
    const media = vendasMes.length ? comissaoMes / vendasMes.length : 0;
    return { comissaoMes, comissaoTotal, media, vendasMes: vendasMes.length };
  }, [vendas]);

  const cards = [
    ['Comissão no mês', brl(resumo.comissaoMes), `${resumo.vendasMes} venda${resumo.vendasMes === 1 ? '' : 's'} no mês`],
    ['Comissão acumulada', brl(resumo.comissaoTotal), 'Total registrado no sistema'],
    ['Média por venda', brl(resumo.media), 'Comissão média no mês'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Resumo de comissões</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
          {cards.map(([label, value, sub]) => (
            <div key={label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '17px 18px' }}>
              <div style={{ color: T.textSec, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
              <div style={{ color: T.accent, fontSize: 25, fontWeight: 800, marginTop: 7 }}>{value}</div>
              <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
      <TabCRM {...props} />
    </div>
  );
}
