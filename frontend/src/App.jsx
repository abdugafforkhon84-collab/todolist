import React from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import { RecordProvider, useRecords } from './store/RecordContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { RecordsPage } from './pages/RecordsPage';
import { DebtsPage } from './pages/DebtsPage';
import { ArchivePage } from './pages/ArchivePage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { RecordModal } from './components/RecordModal';
import { PaymentModal } from './components/PaymentModal';
import { IconPlus } from './assets/icons';

const DashboardContent = () => {
  const {
    activeTab,
    isRecordModalOpen,
    setIsRecordModalOpen,
    editingRecord,
    setEditingRecord,
    payingRecord,
    setPayingRecord,
  } = useRecords();

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Страница управления пользователями — только для admin */}
        {isAdmin && activeTab === 'Пользователи' && <AdminPage />}

        {/* Обычные вкладки — только для обычных пользователей */}
        {!isAdmin && activeTab === 'Записи' && <RecordsPage />}
        {!isAdmin && activeTab === 'Долг' && <DebtsPage />}
        {!isAdmin && activeTab === 'Архив' && <ArchivePage />}

        {/* Плавающая кнопка («+») ТОЛЬКО во вкладке «Записи» для обычных пользователей */}
        {!isAdmin && activeTab === 'Записи' && (
          <button
            className="fab-btn"
            onClick={handleOpenAddModal}
            title="Добавить новую запись"
            aria-label="Добавить новую запись"
          >
            <IconPlus size={22} />
          </button>
        )}

        {/* Модальное окно создания / редактирования записи */}
        <RecordModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setEditingRecord(null);
          }}
          initialData={editingRecord}
        />

        {/* Модальное окно внесения доплаты */}
        <PaymentModal
          isOpen={!!payingRecord}
          onClose={() => setPayingRecord(null)}
          record={payingRecord}
        />
      </main>

      {/* Нижняя мобильная панель навигации */}
      <BottomNav />
    </div>
  );
};

const RootApp = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-muted)'
      }}>
        Загрузка приложения CRM...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <RecordProvider>
      <DashboardContent />
    </RecordProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
