// Regras de comissao por origem e forma de pagamento.
// Valores sao direitos totais; uma parcela futura nao significa dinheiro recebido.
export const FORMAS_PAGAMENTO = ['', 'Cartão de crédito', 'À vista', 'Boleto', 'Recorrência'];
export const isEvento = origem => String(origem || '').trim().toLowerCase() === 'evento';
export const isParceladoEvento = venda => isEvento(venda.origem) && ['Boleto', 'Recorrência'].includes(venda.condicao_pagamento || venda.condicaoPagamento || '');
export const arredondar = valor => Math.round((Number(valor || 0) + Number.EPSILON) * 100) / 100;
export const seisMesesDepois = iso => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return null;
  const [ano, mes, dia] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1 + 6, 1));
  const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2,'0')}-${String(Math.min(dia, ultimo)).padStart(2,'0')}`;
};
export const calcularComissao = venda => {
  const valor = Number(venda.valor || 0);
  const percentual = isEvento(venda.origem) ? 1 : 2.5;
  const total = arredondar(valor * percentual / 100);
  const parcelada = isParceladoEvento(venda);
  const futura = parcelada ? arredondar(valor * 0.005) : 0;
  const imediata = arredondar(total - futura);
  const vencimento = parcelada ? (venda.comissao_futura_vencimento || seisMesesDepois(venda.data_venda || venda.dataVenda)) : null;
  return {percentual,total,imediata,futura,vencimento,parcelada};
};
