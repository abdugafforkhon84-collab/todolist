import React from 'react';
import { useRecords } from '../store/RecordContext';
import { RecordItem } from '../components/RecordItem';
import { IconDebt, IconSearch, IconCheck } from '../assets/icons';

export const DebtsPage = () => {
  const { records, loading, search, setSearch } = useRecords();

  return (
    <div>
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
