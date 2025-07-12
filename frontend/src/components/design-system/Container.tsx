import React from 'react';
import './Container.css';

export type ContainerProps = {
  children: React.ReactNode;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  className?: string;
  style?: React.CSSProperties;
  dataTestId?: string;
};

const Container: React.FC<ContainerProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  style,
  dataTestId
}) => {
  const variantClass = variant === 'default' ? '' : `ds-container--${variant}`;
  const gameSessionClass = dataTestId === 'game-session-container' ? 'game-session-container' : '';
  const classes = `ds-container ${variantClass} ${gameSessionClass} ${className}`.trim();
  
  return (
    <div className={classes} style={style} data-testid={dataTestId}>
      {children}
    </div>
  );
};

export default Container; 