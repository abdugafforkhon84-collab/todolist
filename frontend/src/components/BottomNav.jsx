import React from 'react';
import { useRecords } from '../store/RecordContext';
import { IconRecords, IconDebt, IconArchive } from '../assets/icons';

export const BottomNav = () => {
  const { activeTab, setActiveTab, stats } = useRecords();

  const navItems = [
    {
      id: 'Записи',
      label: 'Записи',
      icon: IconRecords,
      count: stats.active_count,
      isDanger: false,
    },
    {
      id: 'Долг',
      label: 'Долг',
      icon: IconDebt,
      count: stats.debt_count,
      isDanger: stats.debt_count > 0,
    },
    {
      id: 'Архив',
      label: 'Архив',
      icon: IconArchive,
      count: stats.archive_count,
      isDanger: false,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Нижняя навигация">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav-btn ${isActive ? 'active' : ''} ${isActive && item.isDanger ? 'debt-active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="bottom-nav-icon-box">
                <Icon size={20} />
                {item.count > 0 && (
                  <span className={`bottom-nav-badge ${item.isDanger ? 'badge-danger' : ''}`}>
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className="bottom-nav-text">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
