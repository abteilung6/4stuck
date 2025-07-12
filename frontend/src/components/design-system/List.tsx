import React from 'react';

export type ListProps = {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

const ListBase: React.FC<ListProps> = ({ children, className = '', 'aria-label': ariaLabel }) => (
  <ul className={`ds-list ${className}`.trim()} role="list" aria-label={ariaLabel}>
    {children}
  </ul>
);

export type ListItemProps = {
  children: React.ReactNode;
  className?: string;
};

const ListItem: React.FC<ListItemProps> = ({ children, className = '' }) => (
  <li className={`ds-list-item ${className}`.trim()} role="listitem">
    {children}
  </li>
);

const List = ListBase as React.FC<ListProps> & { Item: typeof ListItem };
List.Item = ListItem;

export default List; 