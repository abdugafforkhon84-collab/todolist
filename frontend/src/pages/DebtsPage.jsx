import React from 'react';
import { useRecords } from '../store/RecordContext';
import { RecordItem } from '../components/RecordItem';
import { IconDebt, IconSearch, IconCheck, IconAlert } from '../assets/icons';
import { formatCurrency } from '../utils/formatters';

export const DebtsPage = () => {
  const { records, loading, search, setSearch, stats } = useRecords();

  return (
    <div>
      {/* Debt Summary Banner */}
      <div className="debt-alert-banner">
        <div className="debt-alert-left">
          <div className="debt-alert-icon">
            <IconAlert size={18} />
          </div>
          <div>
            <div className="debt-alert-title">
              Контроль задолженностей
            </div>
            <div className="debt-alert-desc">
              Клиенты с частичной оплатой или долгом
            </div>
          </div>
        </div>

        <div className="debt-alert-amount-box">
          <div className="debt-alert-amount-label">
            Сумма к доплате
          </div>
          <div className="debt-alert-amount-val">
            {formatCurrency(stats.total_debt)}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">
            <IconSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Поиск по должникам (имя, телефон)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="records-count-info">
          Клиентов с долгом: <strong>{records.length}</strong>
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Загрузка записей с задолженностями...
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <IconCheck size={28} />
          </div>
          <h3 className="empty-state-title">
            {search ? 'По запросу должников не найдено' : 'Задолженностей нет!'}
          </h3>
          <p className="empty-state-desc">
            {search
              ? 'Ни одна запись с долгом не соответствует фильтру.'
              : 'Все клиенты внесли 100% оплаты. Записи с частичной оплатой будут автоматически направляться сюда.'}
          </p>
        </div>
      ) : (
        <div className="records-grid">
          {records.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};
