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
  IconChevronUp,
} from '../assets/icons';
import { formatCurrency, calculateDebt } from '../utils/formatters';
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

  return (
    <div
      className={`record-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
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
      {/* Строка заголовка (компактный строчный вид) */}
      <div className="record-header">
        <div className="record-title-group">
          <h3 className="client-name">{record.client_name}</h3>
          <Badge status={record.status} />
        </div>

        {/* Правый блок строки: краткий статус суммы и кнопка раскрытия */}
        <div className="record-header-right">
          {debt > 0 ? (
            <span className="record-row-debt" title="Остаток долга">
              <span className="record-row-debt-label">Долг:</span> {formatCurrency(debt)}
            </span>
          ) : (
            <span className="record-row-paid" title="Оплачено полностью">
              {formatCurrency(record.total_amount)}
            </span>
          )}

          {/* Иконки быстрого редактирования/удаления (видны при раскрытии или наведении) */}
          {isExpanded && (
            <div className="record-header-actions" onClick={(e) => e.stopPropagation()}>
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
          )}

          <span className="record-expand-arrow" aria-hidden="true">
            {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </span>
        </div>
      </div>

      {/* Развернутая информация о записи (показывается при нажатии) */}
      {isExpanded && (
        <div className="record-body animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {/* Мета-информация: Телефон и Период (от и до) */}
          <div className="client-meta">
            <a
              href={`tel:${record.phone_number}`}
              className="meta-item meta-item-phone"
              title="Позвонить клиенту"
              onClick={(e) => e.stopPropagation()}
            >
              <IconPhone size={13} />
              <span>{record.phone_number}</span>
            </a>
            {record.period && (
              <div className="meta-item" title="Период оказания услуг">
                <IconCalendar size={13} />
                <span>{record.period}</span>
              </div>
            )}
          </div>

          {/* Описание задачи */}
          {record.task_description && (
            <div className="task-description">
              {record.task_description}
            </div>
          )}


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
          </div>
        </div>
      )}
    </div>
  );
};
