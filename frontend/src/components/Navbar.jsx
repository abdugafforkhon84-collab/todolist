import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { useRecords } from '../store/RecordContext';
import {
  IconRecords,
  IconDebt,
  IconArchive,
  IconUser,
  IconLogOut,
  IconDownload,
} from '../assets/icons';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab, stats } = useRecords();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

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

        {/* 3 Основные кнопки навигации (для десктопа) */}
        <nav className="nav-tabs desktop-only">
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
            <span className="nav-tab-badge" style={stats.debt_count > 0 ? { backgroundColor: '#dc2626', color: '#fff' } : {}}>
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
        </nav>

        {/* Правый блок: PWA установка, профиль, кнопка Выйти */}
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

          <div className="user-badge" title="Текущий пользователь">
            <IconUser size={14} />
            <span className="user-name-text">{user?.full_name || user?.username || 'Админ'}</span>
          </div>

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
