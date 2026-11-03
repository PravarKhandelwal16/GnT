import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, Handshake, QrCode } from 'lucide-react';
import { markWelcomeSeen } from '../api/profile';
import { getProducts } from '../api/products';
import type { ProductListItem } from '../api/products';
import { Footer, Navbar } from '../components/Layout';
import { ProductCard, ProductCardSkeleton, ProductGrid } from '../components/ProductCard';
import { Button, Credits, EmptyState, Modal, ProductImage, buttonClasses } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { CATEGORIES, conditionLabel } from '../lib/catalog';

const STEPS = [
  {
    icon: Camera,
    title: 'List what you no longer use',
    body: 'Photograph it, set a credit value and earn 40% of that value the moment it goes live.',
  },
  {
    icon: Handshake,
    title: 'Someone reserves it',
    body: 'Their credits are held safely while the two of you arrange a time to meet.',
  },
  {
    icon: QrCode,
    title: 'Swap in person',
    body: 'Scan their code at the handover. The remaining 60% lands in your wallet when they confirm.',
  },
];

const Home: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { requireAuth } = useAuthModal();
  const navigate = useNavigate();

  const [recent, setRecent] = useState<ProductListItem[]>([]);
  const [featured, setFeatured] = useState<ProductListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts({ size: 8 }), getProducts({ size: 1, sort: 'creditValue,desc' })])
      .then(([latest, top]) => {
        setRecent(latest.content);
        setFeatured(top.content[0] ?? null);
      })
      .catch(() => setRecent([]))
      .finally(() => setIsLoading(false));
  }, []);

  const closeWelcome = () => {
    markWelcomeSeen().then(refreshUser).catch(() => {});
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {user && !user.hasSeenWelcome && (
        <Modal title={`Welcome, ${user.shortName}`} onClose={closeWelcome}>
          <p className="text-sm leading-relaxed text-textMain-secondary">
            We've added <strong className="text-textMain">350 credits</strong> to your wallet. Use them on anything in
            the market, or list something of your own to earn more.
          </p>
          <Button className="mt-6 w-full" onClick={closeWelcome}>
            Start exploring
          </Button>
        </Modal>
      )}

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-page items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-20">
          <div className="animate-rise">
            <p className="eyebrow mb-5">{isAuthenticated ? `Good to see you, ${user?.shortName}` : 'A marketplace without money'}</p>
            <h1 className="display text-[2.75rem] leading-[1.06] sm:text-6xl lg:text-7xl">
              Good things deserve <em className="text-primary">another life.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-textMain-secondary">
              Pass on what you no longer use, earn credits for it, and spend them on something a neighbour no longer
              needs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/market" className={buttonClasses('primary', 'lg')}>
                Browse the market <ArrowRight size={17} />
              </Link>
              <Button variant="secondary" size="lg" onClick={() => requireAuth() && navigate('/add-item')}>
                List an item
              </Button>
            </div>
          </div>

          <div className="animate-rise [animation-delay:120ms]">
            {featured ? (
              <Link to={`/product/${featured.id}`} className="group relative block overflow-hidden rounded-3xl border border-border shadow-soft-hover">
                <ProductImage
                  src={featured.primaryMediaUrl}
                  alt={featured.title}
                  className="aspect-[5/5.4] w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-card/95 p-4 shadow-soft backdrop-blur">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{featured.title}</p>
                    <p className="text-sm text-textMain-secondary">
                      {featured.city} · {conditionLabel(featured.condition)}
                    </p>
                  </div>
                  <Credits value={featured.creditValue} />
                </div>
              </Link>
            ) : (
              <div className="panel rounded-3xl p-8">
                <p className="eyebrow mb-6">On a 1,000-credit item</p>
                <dl className="space-y-5">
                  {[
                    ['When you list it', '+400'],
                    ['When the exchange completes', '+600'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between border-b border-border pb-4">
                      <dt className="text-textMain-secondary">{label}</dt>
                      <dd className="display text-3xl">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section aria-label="Categories" className="border-y border-border bg-surface">
          <div className="scroll-row mx-auto flex max-w-page gap-2.5 overflow-x-auto px-4 py-4 sm:px-6">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <Link key={value} to={`/market?category=${value}`} className="chip chip-idle">
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* Latest */}
        <section className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Just listed</p>
              <h2 className="display text-3xl sm:text-4xl">New in the market</h2>
            </div>
            <Link to="/market" className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {isLoading ? (
            <ProductGrid>
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </ProductGrid>
          ) : recent.length === 0 ? (
            <EmptyState
              title="The shelves are empty"
              description="Be the first to pass something on and earn your first listing reward."
              action={<Button onClick={() => requireAuth() && navigate('/add-item')}>List an item</Button>}
            />
          ) : (
            <ProductGrid>
              {recent.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          )}
        </section>

        {/* How it works */}
        <section className="bg-primary text-onPrimary">
          <div className="mx-auto max-w-page px-4 py-16 sm:px-6 lg:py-24">
            <h2 className="display max-w-xl text-3xl sm:text-5xl">No cash. No couriers. Just a fair swap.</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, body }, index) => (
                <li key={title}>
                  <div className="flex items-center gap-3 opacity-80">
                    <Icon size={20} />
                    <span className="text-sm font-semibold">Step {index + 1}</span>
                  </div>
                  <h3 className="display mt-4 text-2xl">{title}</h3>
                  <p className="mt-2 leading-relaxed opacity-80">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
