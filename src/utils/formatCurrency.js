/**
 * Formata um valor numérico para o padrão monetário brasileiro (BRL).
 * Exemplo: 29.90 → "R$ 29,90"
 *
 * @param {number} value - Valor numérico a ser formatado.
 * @returns {string} Valor formatado em BRL.
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
