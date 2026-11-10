import React from 'react';
import { useRecords } from '../store/RecordContext';
import { RecordItem } from '../components/RecordItem';
import { IconRecords, IconPlus, IconSearch } from '../assets/icons';
import { Button } from '../components/ui/Button';

export const RecordsPage = () => {
  const { records, stats, setActiveTab, loading, search, setSearch, setIsRecordModalOpen, setEditingRecord } = useRecords();

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

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
            placeholder="Поиск по имени, телефону или задаче..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-actions-row">
          <span className="records-count-info">
            Активных: <strong>{records.length}</strong>
          </span>
          <Button variant="primary" size="sm" onClick={handleAddNew} icon={<IconPlus size={15} />}>
            Новая запись
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Загрузка активных записей...
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <IconRecords size={28} />
          </div>
          <h3 className="empty-state-title">
            {search ? 'Ничего не найдено' : 'Нет активных записей'}
          </h3>
          <p className="empty-state-desc">
            {search
              ? 'Попробуйте изменить поисковый запрос.'
              : stats.debt_count > 0
                ? `Здесь отображаются клиенты в работе с полной оплатой. Клиенты с частичной оплатой (${stats.debt_count}) собраны во вкладке «Долг».`
                : 'В этом разделе отображаются текущие задачи в работе. Нажмите «+» или кнопку ниже, чтобы добавить клиента.'}
          </p>
          {!search && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="primary" onClick={handleAddNew} icon={<IconPlus size={16} />}>
                Добавить клиента
              </Button>
              {stats.debt_count > 0 && (
                <Button variant="outline" onClick={() => setActiveTab('Долг')}>
                  Открыть «Долг» ({stats.debt_count})
                </Button>
              )}
            </div>
          )}
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
