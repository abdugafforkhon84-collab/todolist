import React from 'react';
import { AuthProvider, useAuth } from './store/AuthContext';
import { RecordProvider, useRecords } from './store/RecordContext';
import { Navbar } from './components/Navbar';
import { RecordsPage } from './pages/RecordsPage';
import { DebtsPage } from './pages/DebtsPage';
import { ArchivePage } from './pages/ArchivePage';
import { LoginPage } from './pages/LoginPage';
import { RecordModal } from './components/RecordModal';
import { PaymentModal } from './components/PaymentModal';
import { IconPlus, IconRecords, IconDebt, IconAlert, IconCheck } from './assets/icons';
import { formatCurrency } from './utils/formatters';

const DashboardContent = () => {
  const {
    activeTab,
    stats,
    isRecordModalOpen,
    setIsRecordModalOpen,
    editingRecord,
    setEditingRecord,
    payingRecord,
    setPayingRecord,
  } = useRecords();

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Верхняя аналитическая панель (Dashboard Stats) */}
        <section className="stats-banner">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-title">В работе (Активно)</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconRecords size={17} color="#4f46e5" />
              </div>
            </div>
            <span className="stat-card-value">{stats.active_count}</span>
          </div>

          <div className="stat-card" style={{ borderColor: stats.debt_count > 0 ? '#fecdd3' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-title">Клиентов с долгом</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconDebt size={17} color="#e11d48" />
              </div>
            </div>
            <span className="stat-card-value debt-text">{stats.debt_count}</span>
          </div>

          <div className="stat-card" style={{ borderColor: stats.total_debt > 0 ? '#fecdd3' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-title">Общий долг клиентов</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconAlert size={17} color="#e11d48" />
              </div>
            </div>
            <span className="stat-card-value debt-text">{formatCurrency(stats.total_debt)}</span>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-title">Фактически получено</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={17} color="#059669" />
              </div>
            </div>
            <span className="stat-card-value revenue-text">{formatCurrency(stats.total_revenue)}</span>
          </div>
        </section>

        {/* Экраны вкладок */}
        {activeTab === 'Записи' && <RecordsPage />}
        {activeTab === 'Долг' && <DebtsPage />}
        {activeTab === 'Архив' && <ArchivePage />}

        {/* Плавающая кнопка добавления («+») в правом нижнем углу */}
        <button
          className="fab-btn"
          onClick={handleOpenAddModal}
          title="Добавить новую запись"
          aria-label="Добавить запись"
        >
          <IconPlus size={28} />
        </button>

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
