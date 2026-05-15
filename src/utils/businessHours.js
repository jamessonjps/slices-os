export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function isOpen(hours) {
  if (!hours) return false;
  
  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  const todayConfig = hours[dayName];
  
  // Se não houver configuração para o dia, ou estiver marcado como fechado
  if (!todayConfig || todayConfig.closed) return false;
  
  // Se não houver horário de abertura ou fechamento
  if (!todayConfig.open || !todayConfig.close) return false;

  try {
    const [openH, openM] = todayConfig.open.split(':').map(Number);
    const [closeH, closeM] = todayConfig.close.split(':').map(Number);
    
    // Convertemos tudo para minutos do dia para facilitar a comparação
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Caso o horário de fechamento seja menor que o de abertura (loja vira a noite)
    if (closeMinutes < openMinutes) {
      // Aberto se: agora >= abertura OU agora < fechamento
      return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
    }

    // Caso padrão (mesmo dia)
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  } catch (e) {
    console.error("Erro ao processar horários:", e);
    return false;
  }
}

export function getHoursDisplay(hours) {
  if (!hours) return [];
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const groups = [];
  let i = 0;
  while (i < days.length) {
    const day = days[i];
    const config = hours[day] || { closed: true };
    let j = i + 1;
    while (j < days.length) {
      const next = hours[days[j]] || { closed: true };
      const sameSchedule = config?.closed === next?.closed &&
        config?.open === next?.open &&
        config?.close === next?.close;
      if (!sameSchedule) break;
      j++;
    }
    if (j - i > 1) {
      groups.push({ label: `${day} a ${days[j - 1]}`, config });
    } else {
      groups.push({ label: day, config });
    }
    i = j;
  }
  return groups;
}
