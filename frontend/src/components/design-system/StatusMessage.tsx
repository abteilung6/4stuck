import React from 'react';
import './StatusMessage.css';

export type StatusMessageProps = {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'error';
  className?: string;
  style?: React.CSSProperties;
};

const icons = {
  info: 'ℹ️',
  success: '✅',
  error: '❌',
};

const StatusMessage: React.FC<StatusMessageProps> = ({ children, type = 'info', className = '', style }) => (
  <div className={`ds-status ds-status--${type} ${className}`.trim()} style={style} data-testid="status-message">
    <span className="ds-status__icon">{icons[type]}</span>
    <span className="ds-status__text">{children}</span>
  </div>
);

export default StatusMessage; 