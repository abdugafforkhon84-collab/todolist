import React, { useState } from 'react';
import { useRecords } from '../store/RecordContext';
import {
  IconRecords,
  IconDebt,
  IconAlert,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from '../assets/icons';
import { formatCurrency } from '../utils/formatters';

export const StatsBanner = () => {
  const { stats } = useRecords();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="stats-section">
      {/* Однострочный вид по умолчанию (кликом разворачивается/сворачивается) */}
      <div
        className={`stats-summary-bar ${isExpanded ? 'is-expanded' : ''}`}
        onClick={() => setIsExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label="Сводка аналитики: нажмите для просмотра подробных карточек"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
      >
        <div className="stats-summary-content">
          <div className="stats-summary-item">
            <span className="stats-summary-dot dot-active" />
            <span className="stats-summary-label">В работе:</span>
            <strong className="stats-summary-val">{stats.active_count}</strong>
          </div>

          <div className="stats-summary-divider" />

          <div className={`stats-summary-item ${stats.debt_count > 0 ? 'item-debt' : ''}`}>
            <span className={`stats-summary-dot ${stats.debt_count > 0 ? 'dot-debt' : 'dot-muted'}`} />
            <span className="stats-summary-label">Долг:</span>
            <strong className="stats-summary-val">
              {stats.debt_count > 0 ? `${stats.debt_count} (${formatCurrency(stats.total_debt)})` : '0 ₸'}
            </strong>
          </div>

          <div className="stats-summary-divider" />

          <div className="stats-summary-item item-revenue">
            <span className="stats-summary-dot dot-revenue" />
            <span className="stats-summary-label">Оплачено:</span>
            <strong className="stats-summary-val">{formatCurrency(stats.total_revenue)}</strong>
          </div>
        </div>

        <div className="stats-summary-toggle">
          <span className="toggle-label">{isExpanded ? 'Свернуть' : 'Подробнее'}</span>
          {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </div>
      </div>

      {/* Развернутые подробные карточки (показываются при нажатии) */}
      {isExpanded && (
        <div className="stats-banner stats-cards-expanded animate-fade-in">
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
        </div>
      )}
    </section>
  );
};
