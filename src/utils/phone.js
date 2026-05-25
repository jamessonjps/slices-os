export function formatPhoneMask(value) {
  if (!value) return '';
  
  // Remove tudo que não for número
  let numbers = value.replace(/\D/g, '');
  
  // Se o usuário digitou mas não começou com 55, adiciona o 55 como prefixo padrão
  if (numbers.length > 0 && !numbers.startsWith('55')) {
    numbers = '55' + numbers;
  }
  
  // Limita a 13 dígitos (55 + 2 DDD + 9 números do celular)
  numbers = numbers.slice(0, 13);
  
  // Aplica a máscara: +55 (XX) XXXXX-XXXX
  let formatted = '';
  if (numbers.length > 0) {
    formatted = '+' + numbers.slice(0, 2); // +55
  }
  if (numbers.length > 2) {
    formatted += ' (' + numbers.slice(2, 4); // (XX)
  }
  if (numbers.length > 4) {
    formatted += ') ' + numbers.slice(4, 9); // XXXXX
  }
  if (numbers.length > 9) {
    formatted += '-' + numbers.slice(9, 13); // XXXX
  }
  
  return formatted;
}

export function unmaskPhone(value) {
  if (!value) return '';
  return value.replace(/\D/g, '');
}
