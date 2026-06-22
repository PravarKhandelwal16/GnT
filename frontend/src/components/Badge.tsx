import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold gap-1.5 shadow-sm";
  const variants = {
    success: "bg-success/10 text-success border border-success/20",
    default: "bg-surface text-textMain-secondary border border-border"
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
