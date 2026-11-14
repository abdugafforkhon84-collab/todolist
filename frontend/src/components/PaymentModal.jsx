import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrency, calculateDebt } from '../utils/formatters';
import { useRecords } from '../store/RecordContext';
import { IconCheck, IconDollar } from '../assets/icons';

export const PaymentModal = ({ isOpen, onClose, record }) => {
  const { addPayment } = useRecords();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentDebt = record ? calculateDebt(record.total_amount, record.paid_amount) : 0;

  useEffect(() => {
    if (record) {
      setAmount(String(currentDebt > 0 ? currentDebt : ''));
      setErrorMsg('');
    }
  }, [record, currentDebt]);

  if (!record) return null;

  const paymentNum = parseFloat(amount) || 0;
  const newDebt = Math.max(0, currentDebt - paymentNum);
  const willArchive = paymentNum >= currentDebt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentNum <= 0) {
      setErrorMsg('Сумма доплаты должна быть больше нуля');
      return;
    }

    setSubmitting(true);
    try {
      await addPayment(record.id, paymentNum);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка внесения оплаты');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Внести доплату"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting} icon={<IconDollar size={16} />}>
            {submitting ? 'Проведение оплаты...' : 'Подтвердить доплату'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errorMsg && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, color: '#be123c', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ background: '#fafafa', padding: 14, borderRadius: 10, border: '1px solid #e4e4e7' }}>
          <div style={{ fontSize: '0.74rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>
            Клиент
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
            {record.client_name}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <div>Всего: <strong>{formatCurrency(record.total_amount)}</strong></div>
            <div>Оплачено: <strong style={{ color: '#059669' }}>{formatCurrency(record.paid_amount)}</strong></div>
            <div>Текущий долг: <strong style={{ color: '#e11d48' }}>{formatCurrency(currentDebt)}</strong></div>
          </div>
        </div>

        <Input
          label="Сумма вносимой доплаты (₸)"
          name="amount"
          type="number"
          step="100"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Введите сумму..."
          required
          autoFocus
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAmount(String(currentDebt))}
          >
            Погасить весь долг ({formatCurrency(currentDebt)})
          </Button>
          {currentDebt > 1000 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAmount(String(Math.round(currentDebt / 2)))}
            >
              Внести 50% ({formatCurrency(Math.round(currentDebt / 2))})
            </Button>
          )}
        </div>

        {/* Индикатор результата */}
        <div className="calc-preview">
          <div className="calc-preview-row">
            <span>Остаток долга после операции:</span>
            <strong style={{ color: newDebt > 0 ? '#e11d48' : '#059669', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(newDebt)}
            </strong>
          </div>
          <div className="calc-preview-row">
            <span>Результат распределения:</span>
            {willArchive ? (
              <span style={{ color: '#065f46', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconCheck size={16} color="#059669" /> Перенос в «Архив» (долг погашен)
              </span>
            ) : (
              <span style={{ color: '#9f1239', fontWeight: 600 }}>
                Останется в разделе «Долг»
              </span>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
