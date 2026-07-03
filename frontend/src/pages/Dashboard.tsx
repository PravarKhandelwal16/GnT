import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { Badge } from '../components/Badge';
import { Upload, Clock, ChevronRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { getProducts, Category, ProductListItem } from '../api/products';
import { markWelcomeSeen } from '../api/profile';

const CATEGORIES: Array<{ id: Category | 'ALL'; name: string }> = [
  { id: 'ALL', name: 'All Items' },
  { id: 'ELECTRONICS', name: 'Electronics' },
  { id: 'HOME_AND_GARDEN', name: 'Home Goods' },
  { id: 'BOOKS', name: 'Books' },
  { id: 'OTHER', name: 'Other' },
];

const DEFAULT_IMG = 'https://placehold.co/600x400/1e293b/a5b4fc?text=No+Image';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { requireAuth } = useAuthModal();
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.hasSeenWelcome === false) {
      setShowWelcome(true);
    }
  }, [isAuthenticated, user]);

  const handleCloseWelcome = async () => {
    try {
      await markWelcomeSeen();
      await refreshUser();
    } catch (e) {
      console.error('Failed to mark welcome seen', e);
    }
    setShowWelcome(false);
  };

  const [recentProducts, setRecentProducts] = useState<ProductListItem[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch recent items
        const recentRes = await getProducts({ size: 4, sort: 'createdAt,desc' });
        setRecentProducts(recentRes.content);

        // Fetch "recommended" items (for demo purposes, let's get high value items)
        const recRes = await getProducts({ size: 3, sort: 'creditValue,desc' });
        setRecommendedProducts(recRes.content);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = (category: string) => {
    if (category === 'ALL') {
      navigate('/market');
    } else {
      navigate(`/market?category=${category}`);
    }
  };

  const handleListClick = () => {
    if (requireAuth()) navigate('/add-item');
  };

  const featured = recommendedProducts[0];
  const sideRecs = recommendedProducts.slice(1, 3);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary mb-2 shadow-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 12h8" /></svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-textMain mb-2">Welcome to Give &amp; Take!</h2>
                <p className="text-textMain-secondary text-lg">
                  Thank you for joining our platform. We have credited your account with <strong className="text-primary font-semibold">350 credits</strong> to get you started!
                </p>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-border text-sm text-textMain-secondary">
                <p>List your unused items on the market to earn more credits. Use credits to claim items you need from others!</p>
              </div>
              <Button variant="primary" className="w-full text-lg py-3 rounded-2xl" onClick={handleCloseWelcome}>
                Let's Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Top Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary-hover rounded-[20px] p-8 text-white shadow-soft flex flex-col justify-between hover:shadow-soft-hover transition-all">
            <div>
              <h2 className="text-lg font-medium opacity-90 mb-2">Available Credits</h2>
              {isAuthenticated ? (
                <div className="flex items-center gap-3 text-5xl font-bold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M8 12h8" />
                  </svg>
                  {user?.creditBalance?.toLocaleString() ?? 0}
                </div>
              ) : (
                <div className="text-2xl font-semibold opacity-90 mt-2">
                  Sign in to view your balance
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              {isAuthenticated ? (
                <>
                  <Button variant="white" onClick={() => navigate('/market')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Earn Credits
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 shadow-none" onClick={() => navigate('/wallet')}>
                    <Clock className="w-5 h-5 mr-2" />
                    View History
                  </Button>
                </>
              ) : (
                <Button variant="white" onClick={() => navigate('/login')}>
                  <LogIn className="w-5 h-5 mr-2" />
                  Join Give &amp; Take
                </Button>
              )}
            </div>
          </div>
          
          <div 
            onClick={handleListClick}
            className="bg-card rounded-[20px] p-8 border border-border flex flex-col items-center justify-center text-center shadow-soft hover:shadow-soft-hover transition-all cursor-pointer group hover:-translate-y-1"
          >
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
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm bg-surface border border-border text-textMain-secondary hover:bg-card hover:text-textMain"
            >
              {category.name}
            </button>
          ))}
        </section>

        {/* Recent Additions */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-textMain">Recent Additions</h2>
            <Link to="/market" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl aspect-[4/5] animate-pulse border border-border" />
              ))
            ) : recentProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-textMain-secondary">
                No recent items found. Check back later!
              </div>
            ) : (
              recentProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  title={product.title}
                  credits={product.creditValue}
                  location="Remote"
                  condition={product.condition}
                  image={product.primaryMediaUrl ?? DEFAULT_IMG}
                />
              ))
            )}
          </div>
        </section>

        {/* Recommended for You */}
        {recommendedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-textMain mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Large Card */}
              {featured && (
                <div className="lg:col-span-2 bg-card rounded-[20px] border border-border overflow-hidden flex flex-col md:flex-row shadow-soft hover:shadow-soft-hover transition-all hover:-translate-y-1">
                  <div className="md:w-1/2 bg-surface aspect-[4/3] md:aspect-auto">
                    <img 
                      src={featured.primaryMediaUrl ?? DEFAULT_IMG} 
                      alt={featured.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-textMain">{featured.title}</h3>
                        <Badge variant="success" className="text-sm px-3 py-1.5 flex-shrink-0 ml-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 12h8" /></svg>
                          {featured.creditValue}
                        </Badge>
                      </div>
                      <p className="text-textMain-secondary mb-6 leading-relaxed">
                        A fantastic offering in the {featured.category.toLowerCase()} category. Currently listed as {featured.condition.replace('_', ' ').toLowerCase()}.
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                      <div className="text-sm text-textMain-secondary flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        Available Now
                      </div>
                      <Button variant="primary" onClick={() => navigate(`/product/${featured.id}`)}>
                        View Item
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Side Cards Stack */}
              {sideRecs.length > 0 && (
                <div className="flex flex-col gap-6">
                  {sideRecs.map(rec => (
                    <div 
                      key={rec.id} 
                      onClick={() => navigate(`/product/${rec.id}`)}
                      className="flex cursor-pointer bg-card rounded-[20px] border border-border overflow-hidden shadow-soft hover:shadow-soft-hover transition-all h-[200px] hover:-translate-y-1"
                    >
                      <div className="w-2/5 bg-surface">
                        <img 
                          src={rec.primaryMediaUrl ?? DEFAULT_IMG} 
                          alt={rec.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="w-3/5 p-5 flex flex-col justify-center">
                        <h3 className="font-semibold text-textMain mb-3 line-clamp-2 leading-tight">{rec.title}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 12h8" /></svg>
                            {rec.creditValue}
                          </Badge>
                          <span className="text-xs font-medium text-textMain-secondary">
                            {rec.condition.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
