import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, CreditCard } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../api/products';
import { initiateTransaction } from '../api/transactions';
import type { ProductDetail } from '../api/products';

export const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getProductById(id)
      .then((p) => {
        setProduct(p);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load product details.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleConfirmOrder = async () => {
    if (!product) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const tx = await initiateTransaction(product.id);
      await refreshUser(); // refresh user to update credit balance
      navigate('/orders', { state: { newTxId: tx.id } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not complete checkout. Please try again.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-card rounded-lg" />
            <div className="h-64 bg-card rounded-[20px] border border-border" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-textMain font-semibold mb-4">Product not found.</p>
          <Link to="/market" className="text-primary hover:underline">Return to Market</Link>
        </main>
      </div>
    );
  }

  const primaryImage = product.media.find(m => m.isPrimary)?.mediaUrl 
    ?? product.media[0]?.mediaUrl 
    ?? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop';

  const userCredits = user?.creditBalance ?? 0;
  const itemCost = product.creditValue;
  const remainingBalance = userCredits - itemCost;
  const hasEnoughCredits = remainingBalance >= 0;

  return (
    <div className="min-h-screen bg-background font-sans text-textMain transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm font-medium text-textMain-secondary hover:text-textMain transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Item Summary */}
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-soft">
              <h2 className="text-xl font-bold mb-4">Item Summary</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-border">
                  <img src={primaryImage} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <p className="text-textMain-secondary text-sm mb-2">Sold by {product.ownerName}</p>
                  <div className="flex items-center text-sm text-textMain-secondary">
                    <MapPin className="w-4 h-4 mr-1" />
                    {product.city}, {product.state}
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery/Pickup Info */}
            <section className="bg-card border border-border rounded-[20px] p-6 shadow-soft">
              <h2 className="text-xl font-bold mb-4">Pickup Method</h2>
              <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex gap-4">
                <div className="bg-primary/20 text-primary p-2 rounded-lg h-min">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-textMain">Local Pickup</h3>
                  <p className="text-sm text-textMain-secondary mt-1">
                    You'll arrange a meeting with the seller. Full address and contact info will be revealed after confirming the order.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-[20px] p-6 shadow-soft sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-textMain-secondary">
                  <span>Item Cost</span>
                  <span className="font-medium text-textMain">{itemCost} Credits</span>
                </div>
                <div className="flex justify-between items-center text-textMain-secondary">
                  <span>Platform Fee</span>
                  <span className="font-medium text-textMain">0 Credits</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{itemCost} Credits</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-textMain-secondary flex items-center">
                    <CreditCard className="w-4 h-4 mr-1.5" /> Your Balance
                  </span>
                  <span className="font-semibold">{userCredits} Credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-textMain-secondary">Remaining</span>
                  <span className={`font-semibold ${hasEnoughCredits ? 'text-success' : 'text-danger'}`}>
                    {hasEnoughCredits ? remainingBalance : 0} Credits
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full py-3.5 rounded-xl text-lg font-bold"
                onClick={handleConfirmOrder}
                disabled={isProcessing || !hasEnoughCredits}
              >
                {isProcessing ? 'Processing...' : !hasEnoughCredits ? 'Insufficient Credits' : 'Confirm Order'}
              </Button>

              <div className="mt-4 flex items-start gap-2 text-xs text-textMain-secondary">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-success" />
                <p>Your transaction is secure. Credits are held securely until the exchange is complete.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
