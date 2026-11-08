import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">C</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            CRM Учет
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Вход в систему учета клиентов и оплат
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#b91c1c',
            fontSize: '0.85rem',
            marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Имя пользователя (Логин)"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
            autoFocus
          />

          <Input
            label="Пароль"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Выполняется вход...' : 'Войти в систему'}
          </Button>
        </form>

        <div className="demo-credentials-box">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Данные по умолчанию:</div>
          <div>Логин: <code>admin</code></div>
          <div>Пароль: <code>admin123</code></div>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              marginTop: 8,
              background: 'none',
              border: 'none',
              color: '#2563eb',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.78rem',
              padding: 0
            }}
          >
            Подставить демонстрационные данные
          </button>
        </div>
      </div>
    </div>
  );
};
