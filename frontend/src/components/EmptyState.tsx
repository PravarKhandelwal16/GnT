import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card border border-border rounded-2xl shadow-soft">
      <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-5 text-textMain-secondary">
        {icon || <PackageOpen className="w-8 h-8 opacity-80" />}
      </div>
      <h3 className="text-xl font-bold text-textMain mb-2">{title}</h3>
      <p className="text-textMain-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
