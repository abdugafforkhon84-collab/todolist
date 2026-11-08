import React from 'react';

export const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  step,
  min,
  max,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        max={max}
        className={`form-input ${error ? 'input-error' : ''}`}
      />
      {helperText && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{helperText}</span>}
      {error && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</span>}
    </div>
  );
};
