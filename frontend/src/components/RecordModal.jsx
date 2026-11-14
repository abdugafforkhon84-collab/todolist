import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatCurrency, calculateDebt, isPeriodExpired } from '../utils/formatters';
import { useRecords } from '../store/RecordContext';
import { IconCalendar } from '../assets/icons';

export const RecordModal = ({ isOpen, onClose, initialData = null }) => {
  const { createRecord, updateRecord } = useRecords();

  const [formData, setFormData] = useState({
    client_name: '',
    phone_number: '',
    period_start: '',
    period_end: '',
    task_description: '',
    total_amount: '',
    paid_amount: '0',
    is_completed: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Парсинг сохраненного периода в две даты (от - до)
  const parsePeriod = (periodStr) => {
    if (!periodStr) return { start: '', end: '' };
    if (periodStr.includes(' — ')) {
      const [s, e] = periodStr.split(' — ');
      return { start: s.trim(), end: (e || '').trim() };
    }
    if (periodStr.includes(' - ')) {
      const [s, e] = periodStr.split(' - ');
      return { start: s.trim(), end: (e || '').trim() };
    }
    return { start: periodStr.trim(), end: periodStr.trim() };
  };

  useEffect(() => {
    if (initialData) {
      const { start, end } = parsePeriod(initialData.period || '');
      setFormData({
        client_name: initialData.client_name || '',
        phone_number: initialData.phone_number || '',
        period_start: start,
        period_end: end || start,
        task_description: initialData.task_description || '',
        total_amount: initialData.total_amount ? String(initialData.total_amount) : '',
        paid_amount: initialData.paid_amount !== undefined ? String(initialData.paid_amount) : '0',
        is_completed: initialData.status === 'Архив',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        client_name: '',
        phone_number: '',
        period_start: today,
        period_end: today,
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

  // Вычисление предполагаемого статуса по правилу:
  // Если срок еще не закончился -> 'Активно' даже при недоплате.
  // Долг будет только после окончания срока, если не оплачено.
  const isExpired = formData.period_end ? isPeriodExpired(formData.period_end) : false;
  let projectedStatus = 'Активно';
  if (formData.is_completed) {
    projectedStatus = 'Архив';
  } else if (totalNum > 0 && paidNum < totalNum) {
    projectedStatus = isExpired ? 'Долг' : 'Активно';
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
    if (!formData.period_start) {
      setErrorMsg('Укажите дату начала периода (С)');
      return;
    }
    if (!formData.period_end) {
      setErrorMsg('Укажите дату окончания периода (По)');
      return;
    }
    if (!formData.task_description.trim()) {
      setErrorMsg('Введите описание задачи');
      return;
    }

    // Формирование периода вида "YYYY-MM-DD — YYYY-MM-DD"
    const periodString =
      formData.period_start === formData.period_end
        ? formData.period_start
        : `${formData.period_start} — ${formData.period_end}`;

    setSubmitting(true);
    try {
      const payload = {
        client_name: formData.client_name.trim(),
        phone_number: formData.phone_number.trim(),
        period: periodString,
        task_description: formData.task_description.trim(),
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
      title={initialData ? 'Редактирование записи' : 'Новая запись'}
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {errorMsg && (
          <div style={{ padding: '9px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: '0.82rem' }}>
            {errorMsg}
          </div>
        )}

        <div className="form-row">
          <Input
            label="Имя клиента"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            placeholder="Имя клиента или компания"
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

        {/* 2 календаря: Период от и до */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconCalendar size={14} />
            <span>Срок оказания услуги (Период: С — По)</span>
            <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="form-row" style={{ marginTop: 2 }}>
            <div className="form-group">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>От (Дата начала):</span>
              <input
                type="date"
                name="period_start"
                value={formData.period_start}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>До (Дата окончания):</span>
              <input
                type="date"
                name="period_end"
                min={formData.period_start || undefined}
                value={formData.period_end}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
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
            placeholder="Полная стоимость"
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
            helperText="Сколько клиент оплатил"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task_description">
            Описание задачи <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            id="task_description"
            name="task_description"
            value={formData.task_description}
            onChange={handleChange}
            placeholder="Опишите суть работы или услуги..."
            required
            className="form-textarea"
          />
        </div>

        {/* Чекбокс завершения, если всё оплачено */}
        {debt === 0 && totalNum > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.84rem', userSelect: 'none' }}>
            <input
              type="checkbox"
              name="is_completed"
              checked={formData.is_completed}
              onChange={handleChange}
              style={{ width: 17, height: 17, cursor: 'pointer' }}
            />
            <span>Задача выполнена (перенести в <strong>Архив</strong>)</span>
          </label>
        )}

        {/* Автоматический расчет остатка и превью */}
        <div className="calc-preview">
          <div className="calc-preview-row">
            <span>Остаток к оплате:</span>
            <strong style={{ color: debt > 0 ? '#e11d48' : '#059669', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(debt)}
            </strong>
          </div>
          <div className="calc-preview-row">
            <span>Статус записи:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Badge status={projectedStatus} />
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {projectedStatus === 'Долг'
                  ? 'Срок истек — есть задолженность'
                  : totalNum > 0 && paidNum < totalNum
                  ? 'Срок еще идет — запись будет в «Активно»'
                  : 'Оплачено полностью'}
              </span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
