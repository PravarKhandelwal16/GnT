import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { getProductById } from '../api/products';
import type { ProductDetail } from '../api/products';
import { initiateTransaction } from '../api/transactions';
import { PageHeader, PageShell } from '../components/Layout';
import { Alert, Button, Credits, EmptyState, ProductImage, Skeleton, buttonClasses } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/format';

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const reserve = async () => {
    if (!product) return;
    setIsProcessing(true);
    setError('');
    try {
      const tx = await initiateTransaction(product.id);
      await refreshUser();
      navigate(`/orders/${tx.id}`, { replace: true });
    } catch (err) {
      setError(apiError(err, "We couldn't reserve this item. Please try again."));
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell width="max-w-3xl">
        <Skeleton className="mb-8 h-12 w-64" />
        <Skeleton className="h-72 w-full" />
      </PageShell>
    );
  }

  if (!product || product.status !== 'ACTIVE' || product.ownerId === user?.id) {
    return (
      <PageShell width="max-w-3xl">
        <EmptyState
          title="This item can't be reserved"
          description="It may already be reserved, or it could be your own listing."
          action={
            <Link to="/market" className={buttonClasses('secondary')}>
              Back to the market
            </Link>
          }
        />
      </PageShell>
    );
  }

  const balance = user?.creditBalance ?? 0;
  const remaining = balance - product.creditValue;
  const canAfford = remaining >= 0;
  const image = product.media.find((m) => m.isPrimary)?.mediaUrl ?? product.media[0]?.mediaUrl ?? null;

  return (
    <PageShell width="max-w-3xl">
      <Link to={`/product/${product.id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-textMain-secondary hover:text-textMain">
        <ArrowLeft size={15} /> Back to item
      </Link>
      <PageHeader title="Reserve this item" />

      <div className="panel overflow-hidden">
        <div className="flex gap-4 p-5 sm:p-6">
          <ProductImage src={image} alt={product.title} className="h-24 w-24 flex-shrink-0 rounded-xl" />
          <div className="min-w-0">
            <h2 className="display text-xl">{product.title}</h2>
            <p className="mt-1 text-sm text-textMain-secondary">From {product.ownerName}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-textMain-secondary">
              <MapPin size={13} /> {product.city}, {product.state}
            </p>
          </div>
        </div>

        <dl className="space-y-3 border-t border-border p-5 text-sm sm:p-6">
          <div className="flex justify-between">
            <dt className="text-textMain-secondary">Your balance</dt>
            <dd><Credits value={balance} /></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textMain-secondary">Item</dt>
            <dd className="font-semibold tabular">−{product.creditValue.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base">
            <dt className="font-medium">Balance afterwards</dt>
            <dd className={canAfford ? '' : 'text-danger'}>
              {canAfford ? <Credits value={remaining} /> : `${Math.abs(remaining).toLocaleString()} short`}
            </dd>
          </div>
        </dl>

        <div className="space-y-3 border-t border-border bg-surface p-5 text-sm text-textMain-secondary sm:p-6">
          <p className="flex items-start gap-2.5">
            <Clock size={16} className="mt-0.5 flex-shrink-0" />
            You'll have 48 hours to meet the seller. Their address and phone number appear once you reserve.
          </p>
          <p className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-success" />
            Your credits are held until the handover, and returned if you cancel or the reservation runs out.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5">
          <Alert>{error}</Alert>
        </div>
      )}

      {canAfford ? (
        <Button id="checkout-confirm" size="lg" className="mt-6 w-full" loading={isProcessing} onClick={reserve}>
          Reserve for {product.creditValue.toLocaleString()} credits
        </Button>
      ) : (
        <Link to="/add-item" className={buttonClasses('primary', 'lg', 'mt-6 w-full')}>
          List an item to earn credits
        </Link>
      )}
    </PageShell>
  );
};

export default Checkout;
