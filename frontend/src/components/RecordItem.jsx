import React from 'react';
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
} from '../assets/icons';
import { formatCurrency, calculateDebt } from '../utils/formatters';
import { useRecords } from '../store/RecordContext';

export const RecordItem = ({ record }) => {
  const {
    setEditingRecord,
    setIsRecordModalOpen,
    setPayingRecord,
    deleteRecord,
    moveToArchive,
    restoreFromArchive,
  } = useRecords();

  const debt = calculateDebt(record.total_amount, record.paid_amount);
  const paidPercent =
    record.total_amount > 0
      ? Math.min(100, Math.round((record.paid_amount / record.total_amount) * 100))
      : 100;

  const handleEdit = () => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить запись клиента «${record.client_name}»?`)) {
      deleteRecord(record.id);
    }
  };

  const handlePay = () => {
    setPayingRecord(record);
  };

  return (
    <div className="record-card">
      {/* Верхняя строка: Имя клиента + Статус слева, Кнопки действий справа */}
      <div className="record-header">
        <div className="record-title-group">
          <h3 className="client-name">{record.client_name}</h3>
          <Badge status={record.status} />
        </div>

        <div className="record-header-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={handleEdit}
            title="Редактировать запись"
            aria-label="Редактировать"
          >
            <IconEdit size={15} />
          </button>
          <button
            type="button"
            className="btn-icon btn-icon-delete"
            onClick={handleDelete}
            title="Удалить запись"
            aria-label="Удалить"
          >
            <IconTrash size={15} />
          </button>
        </div>
      </div>

      {/* Мета-информация: Телефон и Период (от и до) */}
      <div className="client-meta">
        <a
          href={`tel:${record.phone_number}`}
          className="meta-item meta-item-phone"
          title="Позвонить клиенту"
        >
          <IconPhone size={13} />
          <span>{record.phone_number}</span>
        </a>
        <div className="meta-item" title="Период оказания услуг">
          <IconCalendar size={13} />
          <span>{record.period}</span>
        </div>
      </div>

      {/* Описание задачи */}
      {record.task_description && (
        <div className="task-description">
          {record.task_description}
        </div>
      )}

      {/* Прогресс-бар оплаты */}
      <div className="progress-section">
        <div className="progress-labels">
          <span className="progress-title">Оплата</span>
          <span className={`progress-percent ${debt === 0 ? 'paid' : 'debt'}`}>
            {paidPercent}%
          </span>
        </div>
        <div className="progress-bar-container" title={`Оплачено: ${paidPercent}%`}>
          <div
            className={`progress-bar-fill ${debt === 0 ? 'fully-paid' : 'has-debt'}`}
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>

      {/* Финансовый блок: Сумма, Оплачено, Долг */}
      <div className="finance-row">
        <div className="finance-numbers">
          <div className="finance-item">
            <span className="finance-label">Сумма</span>
            <span className="finance-val">{formatCurrency(record.total_amount)}</span>
          </div>

          <div className="finance-item">
            <span className="finance-label">Оплачено</span>
            <span className="finance-val paid">{formatCurrency(record.paid_amount)}</span>
          </div>

          <div className="finance-item">
            <span className="finance-label">Остаток долга</span>
            <span className={`finance-val ${debt > 0 ? 'debt' : ''}`}>
              {debt > 0 && <IconAlert size={14} />}
              {formatCurrency(debt)}
            </span>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="record-actions">
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
              onClick={() => moveToArchive(record.id)}
              icon={<IconArchive size={14} />}
            >
              В архив
            </Button>
          )}

          {record.status === 'Архив' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => restoreFromArchive(record.id)}
              icon={<IconRefresh size={14} />}
            >
              Восстановить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
