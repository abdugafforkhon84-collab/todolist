import React, { useState } from 'react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import {
  IconPhone,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconArchive,
  IconRefresh,
  IconAlert,
  IconDollar,
  IconChevronDown,
} from '../assets/icons';
import {
  formatCurrency,
  formatPhone,
  calculateDebt,
  isPeriodExpired,
  getPeriodDaysRemaining,
  getInitials,
} from '../utils/formatters';
import { useRecords } from '../store/RecordContext';

export const RecordItem = ({ record }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    setEditingRecord,
    setIsRecordModalOpen,
    setPayingRecord,
    deleteRecord,
    moveToArchive,
    restoreFromArchive,
  } = useRecords();

  const debt = calculateDebt(record.total_amount, record.paid_amount);
  const isExpired = isPeriodExpired(record.period);
  const daysRemaining = getPeriodDaysRemaining(record.period);
  const initials = getInitials(record.client_name);
  const formattedPhone = formatPhone(record.phone_number);

  const handleEdit = (e) => {
    e.stopPropagation();
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Удалить запись клиента «${record.client_name}»?`)) {
      deleteRecord(record.id);
    }
  };

  const handlePay = (e) => {
    e.stopPropagation();
    setPayingRecord(record);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    moveToArchive(record.id);
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    restoreFromArchive(record.id);
  };

  // Цветовая схема аватара
  const avatarClass =
    record.status === 'Долг'
      ? 'avatar-debt'
      : record.status === 'Архив'
      ? 'avatar-archive'
      : 'avatar-active';

  return (
    <div
      className={`record-card ${isExpanded ? 'is-expanded' : 'is-collapsed'} ${record.status === 'Долг' ? 'card-status-debt' : ''}`}
      onClick={() => setIsExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`Запись клиента ${record.client_name}. Нажмите, чтобы ${isExpanded ? 'свернуть' : 'развернуть'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded((prev) => !prev);
        }
      }}
    >
      {/* Основная шапка карточки */}
      <div className="card-main-header">
        {/* Верхняя строка: Аватар, Имя + Бейдж, Стрелка */}
        <div className="card-top-row">
          <div className="card-client-wrap">
            <div className={`client-avatar ${avatarClass}`} aria-hidden="true">
              {initials}
            </div>
            <div className="client-info-block">
              <h3 className="client-name" title={record.client_name}>
                {record.client_name}
              </h3>
              <Badge status={record.status} />
            </div>
          </div>

          <span className={`record-chevron-btn ${isExpanded ? 'is-rotated' : ''}`} aria-hidden="true">
            <IconChevronDown size={18} />
          </span>
        </div>

        {/* Финансовая строка: Сумма и статус оплаты */}
        <div className="card-finance-row">
          <div className="card-total-box">
            <span className="finance-label">Сумма:</span>
            <span className="finance-val-total">{formatCurrency(record.total_amount)}</span>
          </div>

          <div className="card-debt-box">
            {record.status === 'Долг' ? (
              <span className="pill-debt-alert">
                <IconAlert size={12} />
                Долг: {formatCurrency(debt)}
              </span>
            ) : debt > 0 ? (
              <span className="pill-remain-warn">
                Остаток: {formatCurrency(debt)}
              </span>
            ) : (
              <span className="pill-paid-success">
                ✓ Оплачено
              </span>
            )}
          </div>
        </div>

        {/* Мета-строка: Телефон и Срок */}
        <div className="card-meta-row">
          <a
            href={`tel:${record.phone_number}`}
            className="meta-pill meta-phone"
            onClick={(e) => e.stopPropagation()}
            title="Позвонить клиенту"
          >
            <IconPhone size={13} />
            <span>{formattedPhone}</span>
          </a>

          {record.period && (
            <div className="meta-pill meta-period" title="Срок выполнения">
              <IconCalendar size={13} />
              <span>{record.period}</span>
            </div>
          )}
        </div>
      </div>

      {/* Развернутая информация о записи */}
      {isExpanded && (
        <div className="record-body animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {/* Срок с интерактивным бейджем дней */}
          {record.period && daysRemaining !== null && (
            <div className="deadline-alert-bar">
              <span
                className={`deadline-badge ${
                  daysRemaining < 0
                    ? 'deadline-overdue'
                    : daysRemaining <= 2
                    ? 'deadline-urgent'
                    : 'deadline-normal'
                }`}
              >
                {daysRemaining < 0
                  ? 'Срок истек'
                  : daysRemaining === 0
                  ? 'Срок сегодня'
                  : `Осталось ${daysRemaining} дн.`}
              </span>
            </div>
          )}

          {/* Описание задачи */}
          {record.task_description && (
            <div className="card-task-box">
              <span className="task-box-label">Задача / Описание</span>
              <p className="task-box-text">{record.task_description}</p>
            </div>
          )}

          {/* Финансовые плитки (3 блока) */}
          <div className="finance-tiles-grid">
            <div className="finance-tile">
              <span className="tile-label">Сумма заказа</span>
              <span className="tile-value">{formatCurrency(record.total_amount)}</span>
            </div>

            <div className="finance-tile tile-paid">
              <span className="tile-label">Оплачено</span>
              <span className="tile-value value-paid">{formatCurrency(record.paid_amount)}</span>
            </div>

            <div className={`finance-tile ${debt > 0 ? 'tile-debt' : 'tile-cleared'}`}>
              <span className="tile-label">
                {record.status === 'Долг'
                  ? 'Сумма долга'
                  : debt > 0
                  ? 'Остаток к оплате'
                  : 'Остаток долга'}
              </span>
              <span className={`tile-value ${debt > 0 ? 'value-debt' : 'value-cleared'}`}>
                {debt > 0 && <IconAlert size={14} />}
                {formatCurrency(debt)}
              </span>
            </div>
          </div>

          {/* Нижняя панель действий */}
          <div className="card-footer-actions">
            {/* Основные действия статуса (Внести доплату / В архив / Восстановить) */}
            <div className="primary-actions">
              {debt > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePay}
                  icon={<IconDollar size={15} />}
                >
                  Внести доплату
                </Button>
              )}

              {record.status === 'Активно' && debt === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleArchive}
                  icon={<IconArchive size={14} />}
                >
                  В архив
                </Button>
              )}

              {record.status === 'Архив' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  icon={<IconRefresh size={14} />}
                >
                  Восстановить
                </Button>
              )}
            </div>

            {/* Вспомогательные действия (Редактировать / Удалить) */}
            <div className="manage-actions">
              <button
                type="button"
                className="action-btn-pill action-edit"
                onClick={handleEdit}
                title="Редактировать запись"
              >
                <IconEdit size={14} />
                <span>Изменить</span>
              </button>
              <button
                type="button"
                className="action-btn-pill action-delete"
                onClick={handleDelete}
                title="Удалить запись"
              >
                <IconTrash size={14} />
                <span>Удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
