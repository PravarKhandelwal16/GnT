import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'white' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-hover text-white shadow-[0_0_15px_rgba(91,124,250,0.3)] hover:shadow-[0_0_20px_rgba(91,124,250,0.5)] rounded-full border border-primary/20 hover:-translate-y-0.5",
    outline: "bg-surface border border-border text-textMain hover:bg-card shadow-soft hover:shadow-soft-hover rounded-xl hover:-translate-y-0.5",
    white: "bg-surface border border-border text-textMain hover:bg-card shadow-soft hover:shadow-soft-hover rounded-xl",
    icon: "p-2 rounded-full bg-surface/50 border border-border hover:bg-card text-textMain hover:text-primary transition-all duration-300 shadow-sm"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-2.5 text-sm gap-2",
    lg: "px-8 py-3.5 text-base gap-2"
  };

  const classes = variant === 'icon' 
    ? `${baseClasses} ${variants[variant]} ${className}`
    : `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
