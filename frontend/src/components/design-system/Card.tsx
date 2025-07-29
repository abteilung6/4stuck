import React from 'react';
import './Card.css';

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const Card: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div className={`ds-card ${className}`.trim()} style={style}>
    {children}
  </div>
);

export default Card;
