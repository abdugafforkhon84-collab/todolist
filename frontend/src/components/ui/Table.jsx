import React from 'react';

export const Table = ({ columns, data, keyField = 'id', emptyMessage = 'Нет данных для отображения' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '32px 16px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        fontSize: '0.9rem'
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.88rem'
      }}>
        <thead>
          <tr style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '12px 16px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  ...col.headerStyle
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row[keyField] || rowIdx}
              style={{
                borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--border-color)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key || colIdx}
                  style={{
                    padding: '14px 16px',
                    verticalAlign: 'middle',
                    color: 'var(--text-primary)',
                    ...col.cellStyle
                  }}
                >
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

