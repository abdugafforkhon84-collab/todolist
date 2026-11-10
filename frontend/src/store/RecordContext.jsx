import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const RecordContext = createContext(null);

export const RecordProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('Записи'); // 'Записи', 'Долг', 'Архив'
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_records: 0,
    active_count: 0,
    debt_count: 0,
    archive_count: 0,
    total_revenue: 0,
    total_debt: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Модальные состояния
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [payingRecord, setPayingRecord] = useState(null);

  // Загрузка статистики
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  }, [isAuthenticated]);

  // Загрузка записей для текущей вкладки
  const loadRecords = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      // Вкладка 'Записи' в интерфейсе соответствует статусу 'Активно'
      const tabParam = activeTab === 'Записи' ? 'Активно' : activeTab;
      const data = await api.getRecords(tabParam, search);
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab, search]);

  const refreshData = useCallback(async () => {
    await Promise.all([loadRecords(), loadStats()]);
  }, [loadRecords, loadStats]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, activeTab, search, refreshData]);

  // Создание новой записи
  const createRecord = async (recordData) => {
    const newRecord = await api.createRecord(recordData);
    // Автоматически переключаем на вкладку созданной записи, чтобы пользователь сразу ее увидел
    if (newRecord.status === 'Долг') {
      setActiveTab('Долг');
    } else if (newRecord.status === 'Архив') {
      setActiveTab('Архив');
    } else {
      setActiveTab('Записи');
    }
    await refreshData();
    return newRecord;
  };

  // Редактирование записи
  const updateRecord = async (id, recordData) => {
    const updated = await api.updateRecord(id, recordData);
    await refreshData();
    return updated;
  };

  // Внесение доплаты
  const addPayment = async (id, amount) => {
    const updated = await api.addPayment(id, amount);
    await refreshData();
    return updated;
  };

  // Удаление записи
  const deleteRecord = async (id) => {
    await api.deleteRecord(id);
    await refreshData();
  };

  // Перевод в архив (выполнено обязательство)
  const moveToArchive = async (id) => {
    await api.updateRecord(id, { status: 'Архив' });
    await refreshData();
  };

  // Возврат из архива в активные
  const restoreFromArchive = async (id) => {
    await api.updateRecord(id, { status: 'Активно' });
    await refreshData();
  };

  return (
    <RecordContext.Provider
      value={{
        activeTab,
        setActiveTab,
        records,
        stats,
        search,
        setSearch,
        loading,
        error,
        refreshData,
        createRecord,
        updateRecord,
        addPayment,
        deleteRecord,
        moveToArchive,
        restoreFromArchive,
        isRecordModalOpen,
        setIsRecordModalOpen,
        editingRecord,
        setEditingRecord,
        payingRecord,
        setPayingRecord,
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};

export const useRecords = () => useContext(RecordContext);
