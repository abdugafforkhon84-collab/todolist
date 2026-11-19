import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { useRecords } from '../store/RecordContext';
import {
  IconRecords,
  IconDebt,
  IconArchive,
  IconLogOut,
  IconDownload,
} from '../assets/icons';

const IconUsers = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Navbar = () => {
  const { logout, user } = useAuth();
  const { activeTab, setActiveTab, stats } = useRecords();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Поддержка PWA события установки
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo">C</div>
          <div>
            <div className="brand-title">CRM Учет</div>
            <div className="brand-subtitle">Клиенты и Оплаты</div>
          </div>
        </div>

        {/* Навигация для десктопа */}
        <nav className="nav-tabs desktop-only">
          {isAdmin ? (
            /* Для admin — только вкладка Пользователи */
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'Пользователи' ? 'active' : ''}`}
              onClick={() => setActiveTab('Пользователи')}
            >
              <IconUsers size={18} />
              <span>Пользователи</span>
            </button>
          ) : (
            /* Для обычных пользователей — стандартные вкладки */
            <>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'Записи' ? 'active' : ''}`}
                onClick={() => setActiveTab('Записи')}
              >
                <IconRecords size={18} />
                <span>Записи</span>
                <span className="nav-tab-badge">{stats.active_count}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'Долг' ? 'active debt-active' : ''}`}
                onClick={() => setActiveTab('Долг')}
              >
                <IconDebt size={18} />
                <span>Долг</span>
                <span className={`nav-tab-badge ${stats.debt_count > 0 ? 'badge-has-debt' : ''}`}>
                  {stats.debt_count}
                </span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'Архив' ? 'active' : ''}`}
                onClick={() => setActiveTab('Архив')}
              >
                <IconArchive size={18} />
                <span>Архив</span>
                <span className="nav-tab-badge">{stats.archive_count}</span>
              </button>
            </>
          )}
        </nav>

        {/* Правый блок: PWA установка, кнопка Выйти */}
        <div className="navbar-actions">
          {isInstallable && (
            <button
              className="btn btn-outline btn-sm pwa-install-btn"
              onClick={handleInstallClick}
              title="Установить PWA на устройство"
            >
              <IconDownload size={14} />
              <span>Установить</span>
            </button>
          )}

          <button
            className="btn btn-outline btn-sm logout-btn"
            onClick={logout}
            title="Выйти из системы"
          >
            <IconLogOut size={14} />
            <span>Выход</span>
          </button>
        </div>
      </div>
    </header>
  );
};
