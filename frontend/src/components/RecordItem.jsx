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

  // Выбор цветовой схемы аватара по статусу
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
      {/* Строка заголовка карточки */}
      <div className="record-header">
        <div className="record-client-info">
          {/* Аватар с инициалами */}
          <div className={`client-avatar ${avatarClass}`} aria-hidden="true">
            {initials}
          </div>

          <div className="client-text-group">
            <div className="client-name-row">
              <h3 className="client-name" title={record.client_name}>
                {record.client_name}
              </h3>
              <Badge status={record.status} />
            </div>

            {/* Подстрочник в свернутом виде для мгновенной информации */}
            <div className="client-subline">
              <span className="subline-item subline-phone">{record.phone_number}</span>
              {record.period && (
                <>
                  <span className="subline-dot">•</span>
                  <span className="subline-item subline-period">{record.period}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Правый блок строки: краткий статус суммы и кнопка раскрытия */}
        <div className="record-header-right">
          <div className="record-price-block">
            {record.status === 'Долг' ? (
              <div className="price-debt-wrap">
                <span className="price-badge-label">ДОЛГ</span>
                <span className="price-debt-value">{formatCurrency(debt)}</span>
              </div>
            ) : debt > 0 ? (
              <div className="price-active-wrap">
                <span className="price-main-value">{formatCurrency(record.total_amount)}</span>
                <span className="price-sub-remain">остаток {formatCurrency(debt)}</span>
              </div>
            ) : (
              <div className="price-paid-wrap">
                <span className="price-paid-value">{formatCurrency(record.total_amount)}</span>
                <span className="price-sub-paid">оплачено</span>
              </div>
            )}
          </div>

          <span className={`record-chevron-btn ${isExpanded ? 'is-rotated' : ''}`} aria-hidden="true">
            <IconChevronDown size={18} />
          </span>
        </div>
      </div>

      {/* Развернутая информация о записи */}
      {isExpanded && (
        <div className="record-body animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {/* Плашки: Телефон и Срок с интерактивным статусом */}
          <div className="card-chips-row">
            <a
              href={`tel:${record.phone_number}`}
              className="info-chip chip-phone"
              title="Позвонить клиенту"
              onClick={(e) => e.stopPropagation()}
            >
              <IconPhone size={14} className="chip-icon" />
              <span className="chip-text">{record.phone_number}</span>
              <span className="chip-badge-hint">Звонок</span>
            </a>

            {record.period && (
              <div className="info-chip chip-period" title="Срок оказания услуг">
                <IconCalendar size={14} className="chip-icon" />
                <span className="chip-text">{record.period}</span>
                {daysRemaining !== null && (
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
                )}
              </div>
            )}
          </div>

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
