import React from 'react';
import { IconCheck, IconAlert, IconArchive } from '../../assets/icons';

export const Badge = ({ status, className = '' }) => {
  let badgeClass = 'badge';
  let icon = null;

  switch (status) {
    case 'Активно':
      badgeClass += ' badge-active';
      icon = <IconCheck size={14} />;
      break;
    case 'Долг':
      badgeClass += ' badge-debt';
      icon = <IconAlert size={14} />;
      break;
    case 'Архив':
      badgeClass += ' badge-archive';
      icon = <IconArchive size={14} />;
      break;
    default:
      badgeClass += ' badge-archive';
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {icon}
      {status}
    </span>
  );
};
