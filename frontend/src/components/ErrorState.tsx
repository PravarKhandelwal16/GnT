import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = "We couldn't load this content right now. Please try again.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card border border-danger/20 rounded-2xl shadow-soft">
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-5 text-danger">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-textMain mb-2">{title}</h3>
      <p className="text-textMain-secondary max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      
      {onRetry && (
        <Button variant="outline" className="border-border hover:bg-surface text-textMain" onClick={onRetry}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};
