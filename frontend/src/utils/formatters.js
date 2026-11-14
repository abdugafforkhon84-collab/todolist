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

export const parsePeriodEndDate = (periodStr) => {
  if (!periodStr) return null;
  const s = String(periodStr).trim();

  // 1. Поиск дат в формате YYYY-MM-DD
  const isoMatches = s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g);
  if (isoMatches && isoMatches.length > 0) {
    const last = isoMatches[isoMatches.length - 1];
    const [y, m, d] = last.split('-').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  // 2. Поиск дат в формате DD.MM.YYYY
  const dotMatches = s.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g);
  if (dotMatches && dotMatches.length > 0) {
    const last = dotMatches[dotMatches.length - 1];
    const [d, m, y] = last.split('.').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  // 3. Русские названия месяцев (например, 'Ноябрь 2026' или '15 ноября 2026')
  const ruMonths = {
    'январ': 0, 'феврал': 1, 'март': 2, 'апрел': 3, 'ма': 4, 'июн': 5,
    'июл': 6, 'август': 7, 'сентябр': 8, 'октябр': 9, 'ноябр': 10, 'декабр': 11
  };
  const sLower = s.toLowerCase();
  for (const [prefix, mIdx] of Object.entries(ruMonths)) {
    if (sLower.includes(prefix)) {
      const yMatch = sLower.match(/\b(20\d\d)\b/);
      const year = yMatch ? Number(yMatch[1]) : new Date().getFullYear();
      const dMatch = sLower.match(new RegExp(`\\b(\\d{1,2})\\s+${prefix}`));
      const day = dMatch ? Number(dMatch[1]) : new Date(year, mIdx + 1, 0).getDate();
      return new Date(year, mIdx, day, 23, 59, 59, 999);
    }
  }

  return null;
};

export const isPeriodExpired = (periodStr) => {
  const endDate = parsePeriodEndDate(periodStr);
  if (!endDate) return false;
  return new Date() > endDate;
};

export const getPeriodDaysRemaining = (periodStr) => {
  const endDate = parsePeriodEndDate(periodStr);
  if (!endDate) return null;
  const now = new Date();
  // Разница по дням
  const msPerDay = 1000 * 60 * 60 * 24;
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
  return Math.round((endMidnight - todayMidnight) / msPerDay);
};

export const getInitials = (name) => {
  if (!name) return 'К';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 1).toUpperCase();
};
