import React from 'react';
import { useRecords } from '../store/RecordContext';
import {
  IconRecords,
  IconDebt,
  IconAlert,
  IconCheck,
} from '../assets/icons';
import { formatCurrency } from '../utils/formatters';

export const StatsBanner = () => {
  const { stats } = useRecords();

  return (
    <section className="stats-banner" aria-label="Сводка аналитики">
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-card-title">В работе (Активно)</span>
          <div className="stat-card-icon-box icon-active">
            <IconRecords size={16} />
          </div>
        </div>
        <span className="stat-card-value">{stats.active_count}</span>
      </div>

      <div className={`stat-card ${stats.debt_count > 0 ? 'card-debt' : ''}`}>
        <div className="stat-card-header">
          <span className="stat-card-title">Клиентов с долгом</span>
          <div className="stat-card-icon-box icon-debt">
            <IconDebt size={16} />
          </div>
        </div>
        <span className={`stat-card-value ${stats.debt_count > 0 ? 'debt-text' : ''}`}>
          {stats.debt_count}
        </span>
      </div>

      <div className={`stat-card ${stats.total_debt > 0 ? 'card-debt' : ''}`}>
        <div className="stat-card-header">
          <span className="stat-card-title">Общий долг клиентов</span>
          <div className="stat-card-icon-box icon-debt">
            <IconAlert size={16} />
          </div>
        </div>
        <span className={`stat-card-value ${stats.total_debt > 0 ? 'debt-text' : ''}`}>
          {formatCurrency(stats.total_debt)}
        </span>
      </div>

      <div className="stat-card card-revenue">
        <div className="stat-card-header">
          <span className="stat-card-title">Фактически получено</span>
          <div className="stat-card-icon-box icon-revenue">
            <IconCheck size={16} />
          </div>
        </div>
        <span className="stat-card-value revenue-text">
          {formatCurrency(stats.total_revenue)}
        </span>
      </div>
    </section>
  );
};
