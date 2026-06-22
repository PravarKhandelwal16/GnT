import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { MapPin } from 'lucide-react';

export interface ProductCardProps {
  id: number | string;
  image: string;
  title: string;
  credits: number;
  location: string;
  condition: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  title,
  credits,
  location,
  condition
}) => {
  return (
    <Link to={`/product/${id}`} target="_blank" rel="noopener noreferrer" className="group flex flex-col bg-card rounded-2xl shadow-soft hover:shadow-soft-hover transition-all duration-300 overflow-hidden border border-border cursor-pointer transform hover:-translate-y-1">
      <div className="relative aspect-[4/3] bg-surface overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="success" className="backdrop-blur-md bg-success/20 border-success/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M8 12h8" />
            </svg>
            {credits}
          </Badge>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-textMain mb-1.5 truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="mt-auto flex items-center text-sm text-textMain-secondary">
          <MapPin className="w-4 h-4 mr-1.5" />
          <span>{location} &middot; {condition}</span>
        </div>
      </div>
    </Link>
  );
};
