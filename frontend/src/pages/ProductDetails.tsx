import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, ArrowLeft, Star, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getProductById, deleteProduct } from '../api/products';
import { initiateTransaction } from '../api/transactions';
import type { ProductDetail } from '../api/products';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Brand New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good / Used',
  FAIR: 'Fair',
  POOR: 'Poor',
};

const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS: 'Electronics',
  BOOKS: 'Books',
  CLOTHING: 'Clothing',
  HOME_AND_GARDEN: 'Home & Garden',
  SPORTS: 'Sports',
  MUSIC: 'Music',
  KITCHEN: 'Kitchen',
  TOYS: 'Toys',
  VEHICLES: 'Vehicles',
  OTHER: 'Other',
};

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [trading, setTrading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getProductById(id)
      .then((p) => {
        setProduct(p);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [id]);

  const handleTrade = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    setTrading(true);
    setTradeError('');
    try {
      const tx = await initiateTransaction(product.id);
      navigate('/orders', { state: { newTxId: tx.id } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not initiate trade. Please try again.';
      setTradeError(msg);
    } finally {
      setTrading(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      setShowDeleteModal(false);
      navigate('/market');
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('Could not delete the product. Ensure it is not locked or already exchanged.');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-[500px] bg-card border border-border rounded-[20px]" />
              <div className="h-48 bg-card border border-border rounded-[20px]" />
            </div>
            <div className="space-y-4">
              <div className="h-72 bg-card border border-border rounded-[20px]" />
              <div className="h-40 bg-card border border-border rounded-[20px]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error ── */
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-[20px] p-12 text-center">
            <p className="text-textMain font-semibold mb-2">Product not found</p>
            <p className="text-textMain-secondary text-sm mb-6">
              This item may have been removed or is no longer available.
            </p>
            <Link
              to="/market"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Marketplace
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = user?.id === product.ownerId;
  const images =
    product.media.length > 0
      ? [...product.media].sort((a, b) => a.displayOrder - b.displayOrder).map((m) => m.imageUrl)
      : ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop'];

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 font-sans text-textMain">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-textMain-secondary mb-6">
          <Link to="/market" className="flex items-center hover:text-textMain transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Market
          </Link>
          <span className="mx-3 opacity-50">/</span>
          <span className="hover:text-textMain cursor-pointer transition-colors">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </span>
          <span className="mx-3 opacity-50">/</span>
          <span className="text-textMain font-medium truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            {images.length === 1 ? (
              <div className="h-[500px] bg-card rounded-[20px] border border-border overflow-hidden shadow-soft">
                <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 h-[500px]">
                <div className="col-span-2 bg-card rounded-[20px] border border-border overflow-hidden relative shadow-soft">
                  <img
                    src={images[activeImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>
                <div className="col-span-1 flex flex-col gap-4">
                  {images.slice(1, 3).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImage(i + 1)}
                      className={`flex-1 bg-card rounded-[20px] border overflow-hidden relative cursor-pointer shadow-soft transition-all ${
                        activeImage === i + 1 ? 'border-primary' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {i === 1 && images.length > 3 && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="bg-surface/80 text-textMain px-4 py-1.5 rounded-full font-medium text-sm shadow-sm backdrop-blur-md border border-border">
                            +{images.length - 3} Photos
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-card rounded-[20px] p-8 shadow-soft border border-border">
              <h2 className="text-xl font-bold text-textMain mb-4">Description</h2>
              <p className="text-textMain-secondary leading-relaxed mb-8 text-[15px]">
                {product.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">
                    Condition
                  </h4>
                  <div className="flex items-center text-textMain font-medium text-[15px]">
                    <BadgeCheck className="w-4 h-4 text-success mr-1.5" />
                    {CONDITION_LABELS[product.condition] ?? product.condition}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">
                    Category
                  </h4>
                  <div className="text-textMain font-medium text-[15px]">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">
                    Status
                  </h4>
                  <div className="text-textMain font-medium text-[15px] capitalize">
                    {product.status.replace(/_/g, ' ').toLowerCase()}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textMain-secondary uppercase tracking-wider mb-2">
                    Listed
                  </h4>
                  <div className="text-textMain font-medium text-[15px]">
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-4 h-4 mr-1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9h.01M15 15h.01" />
                </svg>
                {product.creditValue} Credits
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center text-primary font-bold text-lg">
                    {product.ownerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-textMain">{product.ownerName}</div>
                    <div className="flex items-center text-sm text-textMain-secondary mt-0.5">
                      <Star className="w-4 h-4 text-warning fill-warning mr-1" />
                      Seller
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {tradeError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                  {tradeError}
                </div>
              )}

              <div className="space-y-3">
                {isOwner ? (
                  <div className="space-y-3">
                    <Link
                      to={`/listings`}
                      className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-textMain py-3.5 rounded-xl font-semibold hover:bg-card hover:-translate-y-0.5 transition-all shadow-soft hover:shadow-soft-hover"
                    >
                      Manage Your Listing
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleting}
                      className="w-full flex items-center justify-center gap-2 bg-danger/10 border border-danger/20 text-danger py-3.5 rounded-xl font-semibold hover:bg-danger/20 hover:-translate-y-0.5 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deleting ? 'Deleting...' : 'Delete Listing'}
                    </button>
                  </div>
                ) : product.status !== 'ACTIVE' ? (
                  <div className="w-full text-center py-3.5 rounded-xl bg-surface border border-border text-textMain-secondary text-sm font-medium">
                    {product.status === 'LOCKED'
                      ? 'Item is currently reserved'
                      : product.status === 'EXCHANGED'
                      ? 'Item has been exchanged'
                      : 'Item is not available'}
                  </div>
                ) : (
                  <button
                    id="product-trade-btn"
                    onClick={handleTrade}
                    disabled={trading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-hover text-white py-3.5 rounded-xl font-semibold hover:-translate-y-0.5 transition-all shadow-[0_0_15px_rgba(91,124,250,0.3)] hover:shadow-[0_0_20px_rgba(91,124,250,0.5)] border border-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {trading ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path d="M15 9l-6 6M9 9h.01M15 15h.01" />
                      </svg>
                    )}
                    {trading ? 'Initiating Trade…' : 'Request Trade'}
                  </button>
                )}
              </div>
            </div>

            {/* Pickup Location */}
            <div className="bg-card rounded-[20px] p-6 shadow-soft border border-border hover:shadow-soft-hover transition-all">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-textMain-secondary" />
                <h3 className="font-bold text-textMain text-lg">Pickup Location</h3>
              </div>

              <div className="bg-surface rounded-xl h-48 mb-5 overflow-hidden relative flex items-center justify-center border border-border shadow-inner">
                <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-textMain-secondary" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <MapPin className="w-12 h-12 fill-primary text-background drop-shadow-[0_4px_8px_rgba(91,124,250,0.4)]" strokeWidth={1} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-textMain text-[15px]">
                  {product.street ? (
                    <>
                      <div>{product.street}</div>
                      <div>{product.city}, {product.state} {product.postalCode}</div>
                      <div>{product.country}</div>
                    </>
                  ) : (
                    <div>{product.city}, {product.state}</div>
                  )}
                </div>
                {!product.street && (
                  <p className="text-xs text-textMain-secondary italic">
                    Full address revealed after initiating trade.
                  </p>
                )}
                
                {product.sellerPhone && (
                  <div className="pt-2 mt-2 border-t border-border">
                    <p className="text-sm font-medium text-textMain-secondary mb-1">Seller Contact</p>
                    <p className="text-textMain font-medium">{product.sellerPhone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Item Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-danger/30 rounded-[24px] shadow-2xl w-full max-w-md p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-textMain">Remove Item Listing?</h3>
              <p className="text-sm text-textMain-secondary leading-relaxed">
                Deleting this active listing will remove it from the marketplace.
              </p>
              <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 text-left text-xs text-danger space-y-1">
                <span className="font-semibold block text-sm">Credit Clawback Warning:</span>
                The <strong>40% upfront credit bonus</strong> ({Math.round(product.creditValue * 0.4)} credits) awarded upon listing will be deducted (clawed back) from your account balance.
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-surface border border-border text-textMain rounded-xl font-semibold hover:bg-card transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-danger text-white rounded-xl font-semibold hover:bg-danger-hover transition-all shadow-md disabled:opacity-60"
              >
                {deleting ? 'Removing...' : 'Confirm Remove Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
