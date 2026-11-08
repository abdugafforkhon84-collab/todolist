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
  const { setEditingRecord, setIsRecordModalOpen, setPayingRecord, deleteRecord, moveToArchive, restoreFromArchive } = useRecords();

  const debt = calculateDebt(record.total_amount, record.paid_amount);
  const paidPercent = record.total_amount > 0 ? Math.min(100, Math.round((record.paid_amount / record.total_amount) * 100)) : 100;

  const handleEdit = () => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Вы действительно хотите удалить запись клиента «${record.client_name}»?`)) {
      deleteRecord(record.id);
    }
  };

  const handlePay = () => {
    setPayingRecord(record);
  };

  // Border class based on status
  let borderClass = 'active-border';
  if (record.status === 'Долг') borderClass = 'debt-border';
  if (record.status === 'Архив') borderClass = 'archive-border';

  return (
    <div className={`record-card ${borderClass}`}>
      {/* Header */}
      <div className="record-header">
        <div className="record-client-info">
          <div className="client-name">{record.client_name}</div>
          <div className="client-meta">
            <a href={`tel:${record.phone_number}`} className="meta-item" style={{ color: 'inherit', textDecoration: 'none' }}>
              <IconPhone size={15} color="#4f46e5" />
              <span>{record.phone_number}</span>
            </a>
            <div className="meta-item">
              <IconCalendar size={15} color="#0891b2" />
              <span>{record.period}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge status={record.status} />
          <Button variant="icon" size="sm" onClick={handleEdit} title="Редактировать">
            <IconEdit size={16} />
          </Button>
          <Button variant="icon" size="sm" onClick={handleDelete} title="Удалить">
            <IconTrash size={16} color="#e11d48" />
          </Button>
        </div>
      </div>

      {/* Описание задачи */}
      <div className="task-description">
        {record.task_description}
      </div>

      {/* Прогресс-бар оплаты */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Прогресс оплаты</span>
          <span style={{ color: debt === 0 ? '#059669' : '#e11d48' }}>{paidPercent}%</span>
        </div>
        <div className="progress-bar-container" title={`Оплачено ${paidPercent}%`}>
          <div
            className={`progress-bar-fill ${debt === 0 ? 'fully-paid' : 'has-debt'}`}
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>

      {/* Финансовый блок */}
      <div className="finance-row">
        <div className="finance-numbers">
          <div className="finance-item">
            <span className="finance-label">Сумма к оплате</span>
            <span className="finance-val">{formatCurrency(record.total_amount)}</span>
          </div>

          <div className="finance-item">
            <span className="finance-label">Фактически оплачено</span>
            <span className="finance-val paid">{formatCurrency(record.paid_amount)}</span>
          </div>

          <div className="finance-item">
            <span className="finance-label">Остаток долга</span>
            <span className={`finance-val ${debt > 0 ? 'debt' : ''}`}>
              {debt > 0 && <IconAlert size={16} color="#e11d48" />}
              {formatCurrency(debt)}
            </span>
          </div>
        </div>

        {/* Действия над записью */}
        <div className="record-actions">
          {/* Кнопка "Внести доплату" для должников */}
          {debt > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePay}
              icon={<IconDollar size={16} />}
            >
              Внести доплату
            </Button>
          )}

          {/* Завершить задачу в активных */}
          {record.status === 'Активно' && debt === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveToArchive(record.id)}
              icon={<IconArchive size={15} color="#4f46e5" />}
            >
              В архив
            </Button>
          )}

          {/* Восстановить из архива */}
          {record.status === 'Архив' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => restoreFromArchive(record.id)}
              icon={<IconRefresh size={15} color="#059669" />}
            >
              Восстановить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
