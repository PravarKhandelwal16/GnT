import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, MapPin, ArrowLeft, Star, BadgeCheck } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const ProductDetails: React.FC = () => {

  // Mock data for the page based on the image
  const product = {
    title: 'Vintage Polaroid 600',
    credits: 450,
    category: 'Electronics',
    condition: 'Good / Used',
    acquired: '3 years ago',
    listed: '2 days ago',
    description: "Fully functional vintage Polaroid 600 camera from the late 80s. I've tested it recently and the flash still works perfectly. The rollers are clean and it ejects film smoothly. There are some minor scuffs on the bottom casing from normal use, but the lens is scratch-free. Needs 600 type film (not included).",
    seller: {
      name: 'Sarah J.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
      rating: 4.9,
      trades: 24,
    },
    location: {
      name: 'Pearl District, Portland',
      distance: 'Approx. 2.4 miles away',
    },
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop', // A generic polaroid camera image
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=500&auto=format&fit=crop'
    ]
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 font-sans text-textMain">
      {/* Header */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-textMain-secondary mb-6">
          <Link to="/market" className="flex items-center hover:text-textMain transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Market
          </Link>
          <span className="mx-3 opacity-50">/</span>
          <span className="hover:text-textMain cursor-pointer transition-colors">{product.category}</span>
          <span className="mx-3 opacity-50">/</span>
          <span className="text-textMain font-medium">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images grid */}
            <div className="grid grid-cols-3 gap-4 h-[500px]">
              <div className="col-span-2 bg-card rounded-[20px] border border-border overflow-hidden relative shadow-soft">
                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-1 flex flex-col gap-4">
                <div className="flex-1 bg-card rounded-[20px] border border-border overflow-hidden relative shadow-soft">
                  <img src={product.images[1]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 bg-card rounded-[20px] border border-border overflow-hidden relative group cursor-pointer shadow-soft">
                  <img src={product.images[2]} alt="" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-surface/80 text-textMain px-4 py-1.5 rounded-full font-medium text-sm shadow-sm backdrop-blur-md border border-border">
                      +3 Photos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-card rounded-[20px] p-8 shadow-soft border border-border">
              <h2 className="text-xl font-bold text-textMain mb-4">Description</h2>
              <p className="text-textMain-secondary leading-relaxed mb-8 text-[15px]">
                {product.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">Condition</h4>
                  <div className="flex items-center text-textMain font-medium text-[15px]">
                    <BadgeCheck className="w-4 h-4 text-success mr-1.5" />
                    {product.condition}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">Category</h4>
                  <div className="text-textMain font-medium text-[15px]">{product.category}</div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">Acquired</h4>
                  <div className="text-textMain font-medium text-[15px]">{product.acquired}</div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">Listed</h4>
                  <div className="text-textMain font-medium text-[15px]">{product.listed}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Card */}
            <div className="bg-card rounded-[20px] p-6 shadow-soft hover:shadow-soft-hover transition-all border border-border">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-textMain leading-tight pr-4">{product.title}</h1>
                <button className="text-textMain-secondary hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 rounded-full hover:bg-surface">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
              
              <div className="inline-flex items-center bg-success/10 text-success border border-success/20 px-4 py-1.5 rounded-full font-bold mb-8 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9h.01M15 15h.01" />
                </svg>
                {product.credits} Credits
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border mb-8">
                <div className="flex items-center gap-3">
                  <img src={product.seller.avatar} alt={product.seller.name} className="w-12 h-12 rounded-full object-cover border-2 border-border shadow-sm" />
                  <div>
                    <div className="font-semibold text-textMain">{product.seller.name}</div>
                    <div className="flex items-center text-sm text-textMain-secondary mt-0.5">
                      <Star className="w-4 h-4 text-warning fill-warning mr-1" />
                      {product.seller.rating} ({product.seller.trades} trades)
                    </div>
                  </div>
                </div>
                <Link to="#" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                  View Profile
                </Link>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-hover text-white py-3.5 rounded-xl font-semibold hover:-translate-y-0.5 transition-all shadow-[0_0_15px_rgba(91,124,250,0.3)] hover:shadow-[0_0_20px_rgba(91,124,250,0.5)] border border-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M15 9l-6 6M9 9h.01M15 15h.01" /></svg>
                  Request Trade
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-textMain py-3.5 rounded-xl font-semibold hover:bg-card hover:-translate-y-0.5 transition-all shadow-soft hover:shadow-soft-hover">
                  <MessageSquare className="w-5 h-5" />
                  Message Sarah
                </button>
              </div>
            </div>

            {/* Bottom Card - Location */}
            <div className="bg-card rounded-[20px] p-6 shadow-soft border border-border hover:shadow-soft-hover transition-all">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-textMain-secondary" />
                <h3 className="font-bold text-textMain text-lg">Pickup Location</h3>
              </div>
              
              <div className="bg-surface rounded-xl h-48 mb-5 overflow-hidden relative flex items-center justify-center border border-border shadow-inner">
                {/* Simulated map graphic */}
                <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                   <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-textMain-secondary"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                <div className="bg-surface w-1/2 h-full absolute transform rotate-45 -right-10 top-10 shadow-sm opacity-50"></div>
                <div className="bg-primary/20 w-8 h-full absolute transform -rotate-45 left-1/4"></div>
                <div className="relative z-10">
                  <MapPin className="w-12 h-12 fill-primary text-background drop-shadow-[0_4px_8px_rgba(91,124,250,0.4)]" strokeWidth={1} />
                </div>
              </div>

              <div>
                <div className="font-semibold text-textMain mb-1 text-[15px]">{product.location.name}</div>
                <div className="text-sm text-textMain-secondary">{product.location.distance}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
