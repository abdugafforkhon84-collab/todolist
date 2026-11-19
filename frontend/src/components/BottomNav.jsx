import React from 'react';
import { useRecords } from '../store/RecordContext';
import { useAuth } from '../store/AuthContext';
import { IconRecords, IconDebt, IconArchive } from '../assets/icons';

const IconUsers = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const BottomNav = () => {
  const { activeTab, setActiveTab, stats } = useRecords();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Навигация для admin
  const adminNavItems = [
    {
      id: 'Пользователи',
      label: 'Пользователи',
      icon: IconUsers,
      count: 0,
      isDanger: false,
    },
  ];

  // Навигация для обычных пользователей
  const userNavItems = [
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

  const navItems = isAdmin ? adminNavItems : userNavItems;

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
