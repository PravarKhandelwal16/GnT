import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { Badge } from '../components/Badge';
import { Upload, Clock, ChevronRight } from 'lucide-react';

const CATEGORIES = ['All Items', 'Electronics', 'Home Goods', 'Books', 'Tools'];

// Use absolute paths generated previously or placeholders
const RECENT_ADDITIONS = [
  { id: 1, title: 'Vintage Film Camera', credits: 150, location: 'Downtown', condition: 'Good Condition', image: 'C:\\Users\\Pravar\\.gemini\\antigravity-ide\\brain\\5e963085-7c52-4132-832e-bd7614f3359f\\vintage_camera_1781984957361.png' },
  { id: 2, title: 'Acoustic Guitar', credits: 300, location: 'Westside', condition: 'Like New', image: 'C:\\Users\\Pravar\\.gemini\\antigravity-ide\\brain\\5e963085-7c52-4132-832e-bd7614f3359f\\acoustic_guitar_1781984967161.png' },
  { id: 3, title: 'Stand Mixer Pro', credits: 450, location: 'North Hills', condition: 'Excellent', image: 'C:\\Users\\Pravar\\.gemini\\antigravity-ide\\brain\\5e963085-7c52-4132-832e-bd7614f3359f\\stand_mixer_1781984979401.png' },
  { id: 4, title: 'Design Book Bundle', credits: 50, location: 'East End', condition: 'Fair', image: 'C:\\Users\\Pravar\\.gemini\\antigravity-ide\\brain\\5e963085-7c52-4132-832e-bd7614f3359f\\book_bundle_1781984989422.png' },
];

export const Dashboard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All Items');

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Top Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary-hover rounded-[20px] p-8 text-white shadow-soft flex flex-col justify-between hover:shadow-soft-hover transition-all">
            <div>
              <h2 className="text-lg font-medium opacity-90 mb-2">Available Credits</h2>
              <div className="flex items-center gap-3 text-5xl font-bold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12M8 12h8" />
                </svg>
                1,240
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button variant="white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Earn Credits
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 shadow-none">
                <Clock className="w-5 h-5" />
                View History
              </Button>
            </div>
          </div>
          
          <div className="bg-card rounded-[20px] p-8 border border-border flex flex-col items-center justify-center text-center shadow-soft hover:shadow-soft-hover transition-all cursor-pointer group hover:-translate-y-1">
            <div className="w-16 h-16 bg-surface text-primary rounded-full flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors border border-border">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-textMain mb-2">List an Item</h3>
            <p className="text-sm text-textMain-secondary max-w-[200px]">
              Turn your unused items into community credits.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm ${
                activeCategory === category
                  ? 'bg-primary border border-primary text-white shadow-[0_0_15px_rgba(91,124,250,0.3)]'
                  : 'bg-surface border border-border text-textMain-secondary hover:bg-card hover:text-textMain'
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        {/* Recent Additions */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-textMain">Recent Additions</h2>
            <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RECENT_ADDITIONS.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>

        {/* Recommended for You */}
        <section>
          <h2 className="text-2xl font-bold text-textMain mb-6">Recommended for You</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="lg:col-span-2 bg-card rounded-[20px] border border-border overflow-hidden flex flex-col md:flex-row shadow-soft hover:shadow-soft-hover transition-all hover:-translate-y-1">
              <div className="md:w-1/2 bg-surface aspect-[4/3] md:aspect-auto">
                <img 
                  src="C:\\Users\\Pravar\\.gemini\\antigravity-ide\\brain\\5e963085-7c52-4132-832e-bd7614f3359f\\road_bike_1781985001274.png" 
                  alt="Premium Road Bike" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-textMain">Premium Road Bike</h3>
                    <Badge variant="success" className="text-sm px-3 py-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 12h8" /></svg>
                      1,200
                    </Badge>
                  </div>
                  <p className="text-textMain-secondary mb-6 leading-relaxed">
                    Lightweight aluminum frame, 21-speed gears. Perfect for commuting or weekend rides. Gently used for one summer.
                  </p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                  <div className="text-sm text-textMain-secondary flex items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Central Park District
                  </div>
                  <Button variant="primary">Request Trade</Button>
                </div>
              </div>
            </div>

            {/* Side Cards Stack */}
            <div className="flex flex-col gap-6">
              <div className="flex bg-card rounded-[20px] border border-border overflow-hidden shadow-soft hover:shadow-soft-hover transition-all h-[200px] hover:-translate-y-1">
                <div className="w-2/5 bg-surface">
                  <img src="C:\\Users\\Pravar\\.gemini\\antigravity-ide\\brain\\5e963085-7c52-4132-832e-bd7614f3359f\\mechanical_keyboard_1781985015156.png" alt="Keyboard" className="w-full h-full object-cover" />
                </div>
                <div className="w-3/5 p-5 flex flex-col justify-center">
                  <h3 className="font-semibold text-textMain mb-3 line-clamp-2 leading-tight">Mechanical Keyboard</h3>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="success">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 12h8" /></svg>
                      85
                    </Badge>
                    <span className="text-xs font-medium text-textMain-secondary">Like New</span>
                  </div>
                </div>
              </div>

              <div className="flex bg-card rounded-[20px] border border-border overflow-hidden shadow-soft hover:shadow-soft-hover transition-all h-[200px] hover:-translate-y-1">
                <div className="w-2/5 bg-surface">
                  <img src="C:\\Users\\Pravar\\.gemini\\antigravity-ide\\brain\\5e963085-7c52-4132-832e-bd7614f3359f\\espresso_machine_1781985028130.png" alt="Espresso Machine" className="w-full h-full object-cover" />
                </div>
                <div className="w-3/5 p-5 flex flex-col justify-center">
                  <h3 className="font-semibold text-textMain mb-3 line-clamp-2 leading-tight">Espresso Machine</h3>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="success">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 12h8" /></svg>
                      220
                    </Badge>
                    <span className="text-xs font-medium text-textMain-secondary">Good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
