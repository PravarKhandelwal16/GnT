import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Flag, MapPin, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { getSavedIds, reportProduct, saveProduct, unsaveProduct } from '../api/engagement';
import { deleteProduct, getProductById } from '../api/products';
import type { ProductDetail } from '../api/products';
import { getUserRatings } from '../api/ratings';
import type { RatingResponse } from '../api/ratings';
import { PageShell } from '../components/Layout';
import { Alert, Avatar, Button, Credits, EmptyState, Field, Modal, ProductImage, Skeleton, Stars, StatusBadge, buttonClasses } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useToast } from '../context/ToastContext';
import { categoryLabel, conditionLabel } from '../lib/catalog';
import { apiError, formatDate } from '../lib/format';

const REPORT_REASONS = ['Misleading description', 'Prohibited item', 'Suspected scam', 'Offensive content', 'Other'];

const ReportModal: React.FC<{ productId: number; onClose: () => void }> = ({ productId, onClose }) => {
  const toast = useToast();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await reportProduct(productId, reason, description);
      toast('Thanks. We have your report.');
      onClose();
    } catch (err) {
      setError(apiError(err));
      setSending(false);
    }
  };

  return (
    <Modal title="Report this listing" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="What's wrong?" htmlFor="report-reason">
          <select id="report-reason" className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REPORT_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Anything else? (optional)" htmlFor="report-details">
          <textarea
            id="report-details"
            rows={3}
            maxLength={1000}
            className="field resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={sending}>
          Send report
        </Button>
      </form>
    </Modal>
  );
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { requireAuth } = useAuthModal();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<RatingResponse[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setActiveIndex(0);
    getProductById(id)
      .then((p) => {
        setProduct(p);
        getUserRatings(p.ownerId)
          .then((page) => {
            setReviews(page.content);
            setReviewCount(page.totalElements);
          })
          .catch(() => setReviews([]));
      })
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    getSavedIds()
      .then((ids) => setSaved(ids.includes(Number(id))))
      .catch(() => {});
  }, [isAuthenticated, id]);

  const toggleSaved = async () => {
    if (!product || !requireAuth()) return;
    const next = !saved;
    setSaved(next);
    try {
      await (next ? saveProduct(product.id) : unsaveProduct(product.id));
    } catch (err) {
      setSaved(!next);
      toast(apiError(err), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!product) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteProduct(product.id);
      await refreshUser();
      toast('Listing removed');
      navigate('/listings');
    } catch (err) {
      setDeleteError(apiError(err));
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-52 w-full" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell>
        <EmptyState
          title="This item has moved on"
          description="It may have been removed or found a new home."
          action={
            <Link to="/market" className={buttonClasses('secondary')}>
              Back to the market
            </Link>
          }
        />
      </PageShell>
    );
  }

  const isOwner = user?.id === product.ownerId;
  const media = [...product.media].sort((a, b) => a.displayOrder - b.displayOrder);
  const active = media[activeIndex];
  const reward = product.listingBonus ?? 0;

  return (
    <PageShell>
      <Link to="/market" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-textMain-secondary hover:text-textMain">
        <ArrowLeft size={15} /> Market
      </Link>

      <div className="grid items-start gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            {active?.mediaType === 'VIDEO' ? (
              <video src={active.mediaUrl} controls className="aspect-square w-full bg-black object-contain" />
            ) : (
              <ProductImage src={active?.mediaUrl ?? null} alt={product.title} className="aspect-square w-full" />
            )}
          </div>
          {media.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto scroll-row">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`View ${item.mediaType === 'VIDEO' ? 'video' : 'photo'} ${index + 1}`}
                  aria-current={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    index === activeIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  {item.mediaType === 'VIDEO' ? (
                    <video src={item.mediaUrl} muted className="h-full w-full object-cover" />
                  ) : (
                    <ProductImage src={item.mediaUrl} alt="" className="h-full w-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          <section className="mt-10">
            <h2 className="display text-2xl">About this item</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-textMain-secondary">{product.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-border pt-6 sm:grid-cols-3">
              {[
                ['Condition', conditionLabel(product.condition)],
                ['Category', categoryLabel(product.category)],
                ['Listed', formatDate(product.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-textMain-secondary">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {reviews.length > 0 && (
            <section className="mt-10">
              <h2 className="display text-2xl">Reviews of {product.ownerName}</h2>
              <ul className="mt-4 divide-y divide-border">
                {reviews.map((review) => (
                  <li key={review.id} className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{review.reviewerName}</span>
                      <Stars value={review.rating} size={13} />
                    </div>
                    {review.review && <p className="mt-1.5 text-sm text-textMain-secondary">{review.review}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-4">
            <h1 className="display text-4xl leading-[1.1]">{product.title}</h1>
            <button
              type="button"
              onClick={toggleSaved}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from saved' : 'Save item'}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary/40"
            >
              <Bookmark size={18} className={saved ? 'fill-gold text-gold' : 'text-textMain-secondary'} />
            </button>
          </div>

          <p className="mt-4 text-2xl">
            <Credits value={product.creditValue} size={22} />
            <span className="ml-1.5 text-base text-textMain-secondary">credits</span>
          </p>

          <div className="panel mt-6 p-5">
            {isOwner ? (
              <div className="space-y-3">
                {product.status === 'ACTIVE' && (
                  <Link to={`/listings/${product.id}/edit`} className={buttonClasses('primary', 'lg', 'w-full')}>
                    <Pencil size={16} /> Edit listing
                  </Link>
                )}
                {product.status === 'ACTIVE' ? (
                  <Button variant="ghost" className="w-full text-danger hover:text-danger" onClick={() => setShowDelete(true)}>
                    <Trash2 size={16} /> Remove listing
                  </Button>
                ) : (
                  <p className="text-center text-sm text-textMain-secondary">
                    {product.status === 'LOCKED' ? 'Reserved. See your exchanges for details.' : 'This listing has closed.'}
                  </p>
                )}
              </div>
            ) : product.status === 'ACTIVE' ? (
              <>
                <Link
                  to={`/checkout/${product.id}`}
                  id="product-reserve"
                  className={buttonClasses('primary', 'lg', 'w-full')}
                >
                  Reserve this item
                </Link>
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-textMain-secondary">
                  <ShieldCheck size={15} className="flex-shrink-0 text-success" />
                  Your credits are held until the handover. Cancel before then for a full refund.
                </p>
              </>
            ) : (
              <p className="text-center text-sm font-medium text-textMain-secondary">
                {product.status === 'LOCKED' ? 'Currently reserved by another member' : 'This item has found a new home'}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Avatar name={product.ownerName} image={product.ownerImage} size="h-11 w-11 text-sm" />
            <div>
              <p className="font-medium">{product.ownerName}</p>
              {reviewCount > 0 ? (
                <p className="flex items-center gap-1.5 text-sm text-textMain-secondary">
                  <Stars value={product.ownerRating} size={12} />
                  {product.ownerRating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              ) : (
                <StatusBadge>New member</StatusBadge>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 border-t border-border pt-6">
            <MapPin size={18} className="mt-0.5 flex-shrink-0 text-textMain-secondary" />
            <div className="text-sm">
              <p className="font-medium">
                {product.street ? `${product.street}, ` : ''}
                {product.city}, {product.state}
              </p>
              {!product.street && (
                <p className="mt-0.5 text-textMain-secondary">The exact pickup address is shared after you reserve.</p>
              )}
              {product.sellerPhone && !isOwner && <p className="mt-0.5 text-textMain-secondary">{product.sellerPhone}</p>}
            </div>
          </div>

          {!isOwner && (
            <button
              type="button"
              onClick={() => requireAuth() && setShowReport(true)}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-textMain-secondary hover:text-danger"
            >
              <Flag size={13} /> Report this listing
            </button>
          )}
        </aside>
      </div>

      {showReport && <ReportModal productId={product.id} onClose={() => setShowReport(false)} />}

      {showDelete && (
        <Modal title="Remove this listing?" onClose={() => setShowDelete(false)}>
          <p className="text-sm leading-relaxed text-textMain-secondary">
            It will leave the market and the {reward.toLocaleString()} credit listing reward will be taken back from your
            wallet.
          </p>
          {deleteError && (
            <div className="mt-4">
              <Alert>{deleteError}</Alert>
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowDelete(false)}>
              Keep it
            </Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </PageShell>
  );
};

export default ProductDetails;
