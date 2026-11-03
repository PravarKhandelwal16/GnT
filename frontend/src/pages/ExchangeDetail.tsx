import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Check, Clock, MapPin, Phone, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { submitRating } from '../api/ratings';
import { cancelTransaction, confirmAsBuyer, confirmAsSeller, getTransactionById, isOpen } from '../api/transactions';
import type { TransactionResponse } from '../api/transactions';
import { PageShell } from '../components/Layout';
import { Alert, Button, Credits, EmptyState, Field, Modal, ProductImage, Skeleton, StatusBadge, buttonClasses } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiError, formatCode, formatDateTime, timeLeft } from '../lib/format';
import { EXCHANGE_STATUS } from './Orders';

const QrScanner = lazy(() => import('../components/QrScanner'));

const POLL_MS = 5000;

const Steps: React.FC<{ tx: TransactionResponse }> = ({ tx }) => {
  const done = tx.status === 'COMPLETED';
  const steps = [
    { label: 'Reserved', complete: true },
    { label: 'Seller scanned', complete: tx.sellerConfirmed },
    { label: 'Buyer confirmed', complete: tx.buyerConfirmed },
    { label: 'Credits released', complete: done },
  ];
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((step) => (
        <li key={step.label}>
          <div className={`h-1 rounded-full ${step.complete ? 'bg-primary' : 'bg-textMain/10'}`} />
          <p className={`mt-2 text-xs font-medium ${step.complete ? '' : 'text-textMain-secondary'}`}>{step.label}</p>
        </li>
      ))}
    </ol>
  );
};

const BuyerHandover: React.FC<{ tx: TransactionResponse; onChange: (tx: TransactionResponse) => void }> = ({ tx, onChange }) => {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const code = tx.qrToken ?? '';

  const confirm = async () => {
    setConfirming(true);
    try {
      onChange(await confirmAsBuyer(code));
      setShowConfirm(false);
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <section className="panel p-6 text-center">
      <h2 className="display text-2xl">Your handover code</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-textMain-secondary">
        Show this to {tx.sellerName} when you meet. Don't share it before you have the item.
      </p>
      {/* Always dark on white so it scans in either theme. */}
      <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-4">
        <QRCodeSVG value={code} size={196} level="M" />
      </div>
      <p className="tabular mt-4 font-mono text-xl font-semibold tracking-[0.2em]" data-testid="handover-code">
        {formatCode(code)}
      </p>

      {tx.buyerConfirmed ? (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-success">
          <Check size={16} /> You've confirmed. Waiting for {tx.sellerName} to scan.
        </p>
      ) : (
        <Button id="buyer-confirm" size="lg" className="mt-6 w-full" onClick={() => setShowConfirm(true)}>
          I've received the item
        </Button>
      )}

      {showConfirm && (
        <Modal title="Got the item?" onClose={() => setShowConfirm(false)}>
          <p className="text-sm leading-relaxed text-textMain-secondary">
            Only confirm once it's in your hands. This can't be undone, and {tx.creditsUsed.toLocaleString()} credits go
            towards {tx.sellerName}.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowConfirm(false)}>
              Not yet
            </Button>
            <Button id="buyer-confirm-final" className="flex-1" loading={confirming} onClick={confirm}>
              Yes, confirm
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
};

const SellerHandover: React.FC<{ tx: TransactionResponse; onChange: (tx: TransactionResponse) => void }> = ({ tx, onChange }) => {
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (value: string) => {
    setSubmitting(true);
    setError('');
    setScanning(false);
    try {
      onChange(await confirmAsSeller(value));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (tx.sellerConfirmed) {
    return (
      <section className="panel p-6 text-center">
        <p className="flex items-center justify-center gap-1.5 font-medium text-success">
          <Check size={17} /> Handover recorded
        </p>
        <p className="mt-1 text-sm text-textMain-secondary">
          Your credits are released when {tx.buyerName} confirms, or automatically when the reservation ends.
        </p>
      </section>
    );
  }

  return (
    <section className="panel p-6">
      <h2 className="display text-2xl">Confirm the handover</h2>
      <p className="mt-1 text-sm text-textMain-secondary">
        When you meet, scan the code on {tx.buyerName}'s phone. This is what proves the swap happened.
      </p>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-5">
        {scanning ? (
          <Suspense fallback={<Skeleton className="aspect-square w-full" />}>
            <QrScanner onResult={submit} />
          </Suspense>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setScanning(true)}>
            <Camera size={18} /> Scan code
          </Button>
        )}
      </div>

      <form
        className="mt-5 border-t border-border pt-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) submit(code);
        }}
      >
        <Field label="Or type the code" htmlFor="handover-code-input">
          <div className="flex gap-2">
            <input
              id="handover-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={9}
              autoComplete="off"
              placeholder="XXXX-XXXX"
              className="field font-mono tracking-widest"
            />
            <Button id="seller-confirm" type="submit" variant="secondary" loading={submitting} disabled={!code.trim()}>
              Confirm
            </Button>
          </div>
        </Field>
      </form>
    </section>
  );
};

const RatingPanel: React.FC<{ tx: TransactionResponse; otherName: string; onDone: () => void }> = ({ tx, otherName, onDone }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await submitRating(tx.id, rating, review.trim());
      onDone();
    } catch (err) {
      setError(apiError(err));
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="panel p-6">
      <h2 className="display text-2xl">How was {otherName}?</h2>
      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} out of 5`}
            onClick={() => setRating(value)}
            className="rounded p-1"
          >
            <Star size={28} className={value <= rating ? 'fill-gold text-gold' : 'text-textMain-secondary/40'} />
          </button>
        ))}
      </div>
      <textarea
        aria-label="Review"
        rows={3}
        maxLength={1000}
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Anything others should know? (optional)"
        className="field mt-4 resize-none"
      />
      <Button id="rating-submit" type="submit" className="mt-4 w-full" disabled={rating === 0} loading={sending}>
        Leave rating
      </Button>
    </form>
  );
};

const ExchangeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [tx, setTx] = useState<TransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [now, setNow] = useState(Date.now());

  const applyUpdate = useCallback(
    (next: TransactionResponse) => {
      setTx((previous) => {
        if (previous && previous.status !== next.status) refreshUser();
        return next;
      });
    },
    [refreshUser],
  );

  useEffect(() => {
    if (!id) return;
    getTransactionById(id)
      .then(setTx)
      .catch(() => setTx(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const open = tx ? isOpen(tx.status) : false;

  // Picks up the other person's confirmation without a manual refresh.
  useEffect(() => {
    if (!id || !open) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      getTransactionById(id).then(applyUpdate).catch(() => {});
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [id, open, applyUpdate]);

  const cancel = async () => {
    if (!tx) return;
    setCancelling(true);
    try {
      applyUpdate(await cancelTransaction(tx.id));
      setShowCancel(false);
      toast('Exchange cancelled. Credits returned to the buyer.');
    } catch (err) {
      toast(apiError(err), 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell width="max-w-2xl">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="mt-4 h-96 w-full" />
      </PageShell>
    );
  }

  if (!tx) {
    return (
      <PageShell width="max-w-2xl">
        <EmptyState
          title="Exchange not found"
          description="This link may be out of date."
          action={
            <Link to="/orders" className={buttonClasses('secondary')}>
              Your exchanges
            </Link>
          }
        />
      </PageShell>
    );
  }

  const buying = tx.buyerId === user?.id;
  const otherName = buying ? tx.sellerName : tx.buyerName;
  const status = EXCHANGE_STATUS[tx.status];
  const remaining = open ? timeLeft(tx.expiresAt, now) : null;
  const canCancel = open && !tx.buyerConfirmed && !tx.sellerConfirmed;

  return (
    <PageShell width="max-w-2xl">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-textMain-secondary hover:text-textMain">
        <ArrowLeft size={15} /> Exchanges
      </Link>

      <Link to={`/product/${tx.productId}`} className="flex items-center gap-4">
        <ProductImage src={tx.productImageUrl} alt="" className="h-20 w-20 flex-shrink-0 rounded-xl" />
        <div className="min-w-0">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          <h1 className="display mt-1.5 truncate text-3xl">{tx.productTitle}</h1>
          <p className="text-sm text-textMain-secondary">
            {buying ? `From ${tx.sellerName}` : `To ${tx.buyerName}`} · <Credits value={tx.creditsUsed} size={13} />
          </p>
        </div>
      </Link>

      <div className="mt-6 space-y-4">
        {tx.status !== 'CANCELLED' && tx.status !== 'EXPIRED' && <Steps tx={tx} />}

        {open && (
          <section className="panel divide-y divide-border text-sm">
            {remaining && (
              <p className="flex items-center gap-3 p-4">
                <Clock size={16} className="flex-shrink-0 text-warning" />
                <span>
                  <strong className="font-semibold">{remaining}</strong> · until {formatDateTime(tx.expiresAt)}
                </span>
              </p>
            )}
            {tx.pickupAddress && (
              <p className="flex items-start gap-3 p-4">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-textMain-secondary" />
                {tx.pickupAddress}
              </p>
            )}
            {tx.counterpartPhone && (
              <a href={`tel:${tx.counterpartPhone}`} className="flex items-center gap-3 p-4 hover:text-primary">
                <Phone size={16} className="flex-shrink-0 text-textMain-secondary" />
                Call {otherName} · {tx.counterpartPhone}
              </a>
            )}
          </section>
        )}

        {open && (buying ? <BuyerHandover tx={tx} onChange={applyUpdate} /> : <SellerHandover tx={tx} onChange={applyUpdate} />)}

        {tx.status === 'COMPLETED' && (
          <section className="panel p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Check size={24} />
            </div>
            <h2 className="display text-2xl">Exchange complete</h2>
            <p className="mt-1 text-sm text-textMain-secondary">
              {buying ? 'Enjoy it.' : 'Your credits are in your wallet.'}
              {tx.completedAt && ` Finished ${formatDateTime(tx.completedAt)}.`}
            </p>
            {buying && tx.pickupAddress && <p className="mt-2 text-xs text-textMain-secondary">Collected from {tx.pickupAddress}</p>}
          </section>
        )}

        {tx.status === 'COMPLETED' && !tx.ratedByViewer && (
          <RatingPanel
            tx={tx}
            otherName={otherName}
            onDone={() => {
              setTx({ ...tx, ratedByViewer: true });
              toast('Thanks for your rating');
            }}
          />
        )}

        {(tx.status === 'CANCELLED' || tx.status === 'EXPIRED') && (
          <section className="panel p-6 text-center">
            <h2 className="display text-2xl">
              {tx.status === 'CANCELLED' ? 'This exchange was cancelled' : 'This reservation ran out'}
            </h2>
            <p className="mt-1 text-sm text-textMain-secondary">
              {buying ? 'Your credits have been returned.' : 'Your item is back on the market.'}
            </p>
          </section>
        )}

        {canCancel && (
          <Button variant="ghost" className="w-full text-danger hover:text-danger" onClick={() => setShowCancel(true)}>
            Cancel this exchange
          </Button>
        )}
      </div>

      {showCancel && (
        <Modal title="Cancel this exchange?" onClose={() => setShowCancel(false)}>
          <p className="text-sm leading-relaxed text-textMain-secondary">
            The item goes back on the market and {tx.creditsUsed.toLocaleString()} credits return to{' '}
            {buying ? 'your wallet' : tx.buyerName}.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCancel(false)}>
              Keep it
            </Button>
            <Button variant="danger" className="flex-1" loading={cancelling} onClick={cancel}>
              Cancel exchange
            </Button>
          </div>
        </Modal>
      )}
    </PageShell>
  );
};

export default ExchangeDetail;
