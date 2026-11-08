import React from 'react';
import { useRecords } from '../store/RecordContext';
import { RecordItem } from '../components/RecordItem';
import { IconArchive, IconSearch, IconCheck } from '../assets/icons';

export const ArchivePage = () => {
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
            placeholder="Поиск по архивным записям..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="records-count-info">
          Завершенных задач в архиве: <strong>{records.length}</strong>
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Загрузка архива...
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <IconArchive size={28} />
          </div>
          <h3 className="empty-state-title">
            {search ? 'Ничего не найдено в архиве' : 'Архив пока пуст'}
          </h3>
          <p className="empty-state-desc">
            {search
              ? 'Попробуйте изменить поисковый запрос.'
              : 'Сюда автоматически перемещаются задачи после полного погашения долга или завершения работы.'}
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
