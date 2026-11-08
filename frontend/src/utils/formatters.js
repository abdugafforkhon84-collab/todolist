// Утилиты форматирования для CRM

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₸';
  try {
    const formatted = new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(amount);
    return formatted.replace('KZT', '₸');
  } catch {
    const num = Math.round(Number(amount) || 0).toLocaleString('ru-RU');
    return `${num} ₸`;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.trim();
};

export const calculateDebt = (total, paid) => {
  const t = parseFloat(total) || 0;
  const p = parseFloat(paid) || 0;
  return Math.max(0, Math.round((t - p) * 100) / 100);
};
