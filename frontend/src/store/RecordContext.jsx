import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const RecordContext = createContext(null);

export const RecordProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Для admin — начальная вкладка "Пользователи", для user — "Записи"
  const [activeTab, setActiveTab] = useState(isAdmin ? 'Пользователи' : 'Записи');
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

  // Загрузка статистики (только для обычных пользователей)
  const loadStats = useCallback(async () => {
    if (!isAuthenticated || isAdmin) return;
    try {
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  }, [isAuthenticated, isAdmin]);

  // Загрузка записей для текущей вкладки
  const loadRecords = useCallback(async () => {
    if (!isAuthenticated || isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const tabParam = activeTab === 'Записи' ? 'Активно' : activeTab;
      const data = await api.getRecords(tabParam, search);
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, activeTab, search]);

  const refreshData = useCallback(async () => {
    await Promise.all([loadRecords(), loadStats()]);
  }, [loadRecords, loadStats]);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      refreshData();
    }
  }, [isAuthenticated, isAdmin, activeTab, search, refreshData]);

  // Создание новой записи
  const createRecord = async (recordData) => {
    const newRecord = await api.createRecord(recordData);
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

  // Перевод в архив
  const moveToArchive = async (id) => {
    await api.updateRecord(id, { status: 'Архив' });
    await refreshData();
  };

  // Возврат из архива
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
