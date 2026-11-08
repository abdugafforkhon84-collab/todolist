import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatCurrency, calculateDebt } from '../utils/formatters';
import { useRecords } from '../store/RecordContext';

export const RecordModal = ({ isOpen, onClose, initialData = null }) => {
  const { createRecord, updateRecord } = useRecords();

  const [formData, setFormData] = useState({
    client_name: '',
    phone_number: '',
    period: '',
    task_description: '',
    total_amount: '',
    paid_amount: '0',
    is_completed: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        client_name: initialData.client_name || '',
        phone_number: initialData.phone_number || '',
        period: initialData.period || '',
        task_description: initialData.task_description || '',
        total_amount: initialData.total_amount ? String(initialData.total_amount) : '',
        paid_amount: initialData.paid_amount !== undefined ? String(initialData.paid_amount) : '0',
        is_completed: initialData.status === 'Архив',
      });
    } else {
      setFormData({
        client_name: '',
        phone_number: '',
        period: '',
        task_description: '',
        total_amount: '',
        paid_amount: '0',
        is_completed: false,
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const totalNum = parseFloat(formData.total_amount) || 0;
  const paidNum = parseFloat(formData.paid_amount) || 0;
  const debt = calculateDebt(totalNum, paidNum);

  // Вычисление предполагаемого статуса
  let projectedStatus = 'Активно';
  if (totalNum > 0 && paidNum < totalNum) {
    projectedStatus = 'Долг';
  } else if (formData.is_completed) {
    projectedStatus = 'Архив';
  } else {
    projectedStatus = 'Активно';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.client_name.trim()) {
      setErrorMsg('Укажите имя клиента');
      return;
    }
    if (!formData.phone_number.trim()) {
      setErrorMsg('Укажите номер телефона');
      return;
    }
    if (totalNum <= 0) {
      setErrorMsg('Сумма к оплате должна быть больше 0');
      return;
    }
    if (!formData.period.trim()) {
      setErrorMsg('Укажите срок / период');
      return;
    }
    if (!formData.task_description.trim()) {
      setErrorMsg('Введите описание задачи');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client_name: formData.client_name,
        phone_number: formData.phone_number,
        period: formData.period,
        task_description: formData.task_description,
        total_amount: totalNum,
        paid_amount: paidNum,
        is_completed: formData.is_completed,
      };

      if (initialData && initialData.id) {
        await updateRecord(initialData.id, payload);
      } else {
        await createRecord(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка сохранения записи');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Редактирование записи клиента' : 'Добавить новую запись'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Сохранение...' : initialData ? 'Сохранить изменения' : 'Создать запись'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errorMsg && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <div className="form-row">
          <Input
            label="Имя клиента"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            placeholder="например, Алексей Смирнов"
            required
          />
          <Input
            label="Номер телефона"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+7 (999) 000-00-00"
            required
          />
        </div>

        <div className="form-row">
          <Input
            label="Сумма к оплате (₸)"
            name="total_amount"
            type="number"
            step="100"
            min="0"
            value={formData.total_amount}
            onChange={handleChange}
            placeholder="Полная стоимость услуги"
            required
          />
          <Input
            label="Фактически оплачено (₸)"
            name="paid_amount"
            type="number"
            step="100"
            min="0"
            value={formData.paid_amount}
            onChange={handleChange}
            placeholder="0"
            helperText="Сколько клиент внес сейчас"
          />
        </div>

        <Input
          label="Срок (период)"
          name="period"
          type="date"
          value={formData.period}
          onChange={handleChange}
          placeholder="Выберите дату"
          required
        />

        <div className="form-group">
          <label className="form-label" htmlFor="task_description">
            Описание задачи <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            id="task_description"
            name="task_description"
            value={formData.task_description}
            onChange={handleChange}
            placeholder="Подробно опишите, что именно требуется сделать для клиента..."
            required
            className="form-textarea"
          />
        </div>

        {/* Чекбокс завершения, если всё оплачено */}
        {debt === 0 && totalNum > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.88rem', userSelect: 'none' }}>
            <input
              type="checkbox"
              name="is_completed"
              checked={formData.is_completed}
              onChange={handleChange}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <span>Задача уже полностью выполнена (отправить сразу в <strong>Архив</strong>)</span>
          </label>
        )}

        {/* Автоматический расчет и превью статуса */}
        <div className="calc-preview">
          <div className="calc-preview-row">
            <span>Расчетный остаток долга:</span>
            <strong style={{ color: debt > 0 ? '#dc2626' : '#16a34a', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(debt)}
            </strong>
          </div>
          <div className="calc-preview-row">
            <span>Куда попадет запись:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Вкладка</span>
              <Badge status={projectedStatus} />
            </div>
          </div>
          {debt > 0 && (
            <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: 4 }}>
              * Оплачено меньше полной стоимости ➔ система автоматически зафиксирует статус «Долг».
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
