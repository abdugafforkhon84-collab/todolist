import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'outline', 'danger-outline', 'icon'
  size = 'md', // 'sm', 'md'
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  title,
  icon,
}) => {
  let baseClass = 'btn';
  if (variant === 'primary') baseClass += ' btn-primary';
  if (variant === 'outline') baseClass += ' btn-outline';
  if (variant === 'danger-outline') baseClass += ' btn-danger-outline';
  if (variant === 'icon') baseClass += ' btn-icon';
  if (size === 'sm') baseClass += ' btn-sm';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClass} ${className}`}
    >
      {icon && <span className="btn-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
};
