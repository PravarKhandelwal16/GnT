import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, Info, Star, Leaf } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export interface MarketProductCardProps {
  id: number | string;
  image: string;
  title: string;
  credits: number;
  location: string;
  condition: string;
}

export const MarketProductCard: React.FC<MarketProductCardProps> = ({
  id,
  image,
  title,
  credits,
  location,
  condition
}) => {
  // Determine condition icon
  let ConditionIcon = Info;
  if (condition.includes('Excellent')) ConditionIcon = BadgeCheck;
  if (condition.includes('Like New')) ConditionIcon = Star;
  if (condition.includes('Thriving')) ConditionIcon = Leaf;

  return (
    <Link to={`/product/${id}`} target="_blank" rel="noopener noreferrer" className="flex flex-col bg-card rounded-2xl shadow-soft hover:shadow-soft-hover border border-border overflow-hidden transition-all duration-300 group hover:-translate-y-1">
      <div className="relative h-56 bg-surface overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="success" className="backdrop-blur-md bg-success/20 border-success/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9h.01M15 15h.01" />
            </svg>
            {credits}
          </Badge>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-textMain mb-3 truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-textMain-secondary mb-1.5">
          <ConditionIcon className="w-4 h-4 mr-2" />
          <span className="truncate">{condition}</span>
        </div>
        
        <div className="flex items-center text-sm text-textMain-secondary mb-5">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">{location}</span>
        </div>
        
        <div className="mt-auto pt-2 border-t border-border">
          <Button variant="primary" className="w-full mt-4">
            Reserve Item
          </Button>
        </div>
      </div>
    </Link>
  );
};
