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
      <div style={{
        background: '#fff1f2',
        border: '1px solid #fecdd3',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#ffe4e6',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: 600, textTransform: 'uppercase' }}>
              Контроль задолженностей
            </div>
            <div style={{ fontSize: '0.85rem', color: '#881337' }}>
              Здесь собраны клиенты с частичной оплатой или предоплатой
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#9f1239', textTransform: 'uppercase', fontWeight: 700 }}>
            Сумма к доплате
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#be123c', fontFamily: 'var(--font-mono)' }}>
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
