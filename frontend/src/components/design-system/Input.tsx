import React from 'react';
import './Input.css';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`ds-input ${className}`.trim()}
    />
  );
};

export default Input; 