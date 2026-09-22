import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);
