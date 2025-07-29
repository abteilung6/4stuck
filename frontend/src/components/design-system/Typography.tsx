import React from 'react';
import './Typography.css';

// Heading Components
export type HeadingProps = {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  style?: React.CSSProperties;
};

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 2,
  className = '',
  style
}) => {
  const Tag: React.ElementType = `h${level}` as React.ElementType;
  return (
    <Tag
      className={`ds-heading ds-heading--h${level} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
};

// Text Components
export type TextProps = {
  children: React.ReactNode;
  variant?: 'body' | 'body-large' | 'body-small' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'success' | 'error' | 'warning' | 'info';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
};

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  className = '',
  style,
  as: Component = 'p'
}) => {
  const classes = [
    'ds-text',
    `ds-text--${variant}`,
    `ds-text--${color}`,
    `ds-text--${weight}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  );
};

// Specialized Text Components
export const BodyText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body" {...props} />
);

export const BodyLarge: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body-large" {...props} />
);

export const BodySmall: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body-small" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label" {...props} />
);

// Question Text Component (for puzzles)
export type QuestionTextProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const QuestionText: React.FC<QuestionTextProps> = ({
  children,
  className = '',
  style
}) => (
  <Text
    variant="body-large"
    weight="medium"
    className={`ds-text--margin-bottom-large ${className}`.trim()}
    style={style}
  >
    {children}
  </Text>
);

// Choice Text Component (for puzzle choices)
export type ChoiceTextProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const ChoiceText: React.FC<ChoiceTextProps> = ({
  children,
  className = '',
  style
}) => (
  <Text
    variant="body"
    weight="normal"
    className={className}
    style={style}
  >
    {children}
  </Text>
);

export default {
  Heading,
  Text,
  BodyText,
  BodyLarge,
  BodySmall,
  Caption,
  Label,
  QuestionText,
  ChoiceText
};
