import React from 'react';
import './SectionTitle.css';

export type SectionTitleProps = {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
  style?: React.CSSProperties;
};

const tagMap = { 1: 'h1', 2: 'h2', 3: 'h3' } as const;

const SectionTitle: React.FC<SectionTitleProps> = ({ children, level = 2, className = '', style }) => {
  const Tag: React.ElementType = tagMap[level];
  return <Tag className={`ds-section-title ds-section-title--l${level} ${className}`.trim()} style={style}>{children}</Tag>;
};

export default SectionTitle; 