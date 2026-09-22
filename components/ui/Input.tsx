import * as React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-shadow bg-white text-[#212121] placeholder-gray-400 ${className}`}
    {...props}
  />
);

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

export const Label: React.FC<LabelProps> = ({ className = '', htmlFor, children, ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-[#212121] mb-1 ${className}`}
    {...props}
  >
    {children}
  </label>
);
