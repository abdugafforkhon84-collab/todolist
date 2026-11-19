import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const IconUser = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPlus = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconEdit = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconClose = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EMPTY_FORM = { full_name: '', phone: '', username: '', password: '' };

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // user to delete

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Ошибка загрузки пользователей: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ full_name: user.full_name || '', phone: user.phone || '', username: user.username, password: '' });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim()) return setError('Логин обязателен');
    if (!editingUser && !form.password.trim()) return setError('Пароль обязателен при создании');
    setSaving(true);
    try {
      if (editingUser) {
        const updateData = {
          full_name: form.full_name,
          phone: form.phone,
          username: form.username,
        };
        if (form.password.trim()) updateData.password = form.password;
        await api.updateUser(editingUser.id, updateData);
      } else {
        await api.createUser({
          full_name: form.full_name,
          phone: form.phone,
          username: form.username,
          password: form.password,
        });
      }
      closeModal();
      loadUsers();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    try {
      await api.deleteUser(user.id);
      setDeleteConfirm(null);
      loadUsers();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div>
      {/* Шапка раздела */}
      <div className="toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconUser size={20} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            Управление пользователями
          </span>
        </div>
        <div className="toolbar-actions-row">
          <span className="records-count-info">
            Всего: <strong>{users.length}</strong>
          </span>
          <Button variant="primary" size="sm" onClick={openCreate} icon={<IconPlus size={15} />}>
            Добавить пользователя
          </Button>
        </div>
      </div>

      {/* Список пользователей */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Загрузка пользователей...
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconUser size={28} /></div>
          <h3 className="empty-state-title">Нет пользователей</h3>
          <p className="empty-state-desc">Добавьте первого пользователя, нажав кнопку выше.</p>
          <Button variant="primary" onClick={openCreate} icon={<IconPlus size={16} />}>
            Добавить пользователя
          </Button>
        </div>
      ) : (
        <div className="records-grid">
          {users.map((user) => (
            <div key={user.id} className="record-card" style={{ position: 'relative' }}>
              {/* Аватар + имя */}
              <div className="card-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--primary-light)', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)', flexShrink: 0
                  }}>
                    <IconUser size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="client-name" style={{ fontSize: '0.95rem' }}>
                      {user.full_name || user.username}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Логин: <strong style={{ color: 'var(--text-secondary)' }}>{user.username}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Телефон */}
              {user.phone && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>📞</span>
                  <span>{user.phone}</span>
                </div>
              )}

              {/* Дата регистрации */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Добавлен: {formatDate(user.created_at)}
              </div>

              {/* Действия */}
              <div className="card-footer-actions" style={{ marginTop: 14 }}>
                <div className="primary-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openEdit(user)}
                    style={{ flex: 1 }}
                  >
                    <IconEdit size={13} />
                    Изменить
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => setDeleteConfirm(user)}
                    style={{ flex: 1, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                  >
                    <IconTrash size={13} />
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания/редактирования */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? 'Изменить пользователя' : 'Добавить пользователя'}
              </h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    color: '#b91c1c',
                    fontSize: '0.85rem'
                  }}>
                    {error}
                  </div>
                )}

                <Input
                  label="Имя пользователя"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Например: Иван Петров"
                />

                <Input
                  label="Номер телефона"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                />

                <Input
                  label="Логин"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="user123"
                  required
                />

                <Input
                  label={editingUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required={!editingUser}
                />
              </div>

              <div className="modal-footer">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Отмена
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Сохранение...' : editingUser ? 'Сохранить изменения' : 'Создать пользователя'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Удалить пользователя?</h3>
              <button className="modal-close-btn" onClick={() => setDeleteConfirm(null)}>
                <IconClose size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Вы собираетесь удалить пользователя <strong>{deleteConfirm.full_name || deleteConfirm.username}</strong>.
                Все его записи также будут удалены. Это действие нельзя отменить.
              </p>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDelete(deleteConfirm)}
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

