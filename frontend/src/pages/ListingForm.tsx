import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { createProduct, getProductById, updateProduct } from '../api/products';
import type { Category, Condition, ProductDetail } from '../api/products';
import { getMyProfile } from '../api/profile';
import { PageHeader, PageShell } from '../components/Layout';
import { Alert, Button, Credits, EmptyState, Field, ProductImage, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, CONDITIONS, MAX_CREDIT_VALUE, listingReward } from '../lib/catalog';
import { apiError } from '../lib/format';

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

interface FormState {
  title: string;
  category: Category;
  condition: Condition;
  credits: string;
  description: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const EMPTY: FormState = {
  title: '',
  category: 'ELECTRONICS',
  condition: 'GOOD',
  credits: '',
  description: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

const ListingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [existing, setExisting] = useState<ProductDetail | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(editing);
  const [notEditable, setNotEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getProductById(id)
        .then((product) => {
          if (product.ownerId !== user?.id || product.status !== 'ACTIVE') {
            setNotEditable(true);
            return;
          }
          setExisting(product);
          setForm({
            title: product.title,
            category: product.category,
            condition: product.condition,
            credits: String(product.creditValue),
            description: product.description,
            street: product.street ?? '',
            city: product.city,
            state: product.state,
            postalCode: product.postalCode ?? '',
            country: product.country,
          });
        })
        .catch(() => setNotEditable(true))
        .finally(() => setIsLoading(false));
    } else {
      // Most listings are collected from home, so start from the saved address.
      getMyProfile()
        .then((profile) =>
          setForm((current) => ({
            ...current,
            street: current.street || (profile.street ?? ''),
            city: current.city || (profile.city ?? ''),
            state: current.state || (profile.state ?? ''),
            postalCode: current.postalCode || (profile.postalCode ?? ''),
            country: current.country || (profile.country ?? ''),
          })),
        )
        .catch(() => {});
    }
  }, [id, user?.id]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const set = (name: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [name]: e.target.value }));
    setError('');
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const tooLarge = picked.find((file) => file.size > MAX_PHOTO_BYTES);
    if (tooLarge) {
      setError(`${tooLarge.name} is over 5 MB.`);
      return;
    }
    setFiles((current) => [...current, ...picked].slice(0, MAX_PHOTOS));
  };

  const value = Number(form.credits) || 0;
  const reward = listingReward(value);
  const rewardChange = existing ? reward - (existing.listingBonus ?? 0) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && files.length === 0) {
      setError('Add at least one photo.');
      return;
    }
    if (value < 1 || value > MAX_CREDIT_VALUE) {
      setError(`Choose a value from 1 to ${MAX_CREDIT_VALUE.toLocaleString()} credits.`);
      return;
    }

    setIsSaving(true);
    setError('');
    const input = {
      title: form.title,
      description: form.description,
      category: form.category,
      condition: form.condition,
      creditValue: value,
      street: form.street,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
    };

    try {
      const saved = existing ? await updateProduct(existing.id, input, files) : await createProduct(input, files);
      await refreshUser();
      toast(existing ? 'Listing updated' : `Listed. ${reward.toLocaleString()} credits are in your wallet.`);
      navigate(`/product/${saved.id}`, { replace: true });
    } catch (err) {
      setError(apiError(err, "We couldn't save this listing. Please try again."));
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell width="max-w-2xl">
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  if (notEditable) {
    return (
      <PageShell width="max-w-2xl">
        <EmptyState title="This listing can't be edited" description="Only live listings you own can be changed." />
      </PageShell>
    );
  }

  const inputs: Array<{ name: keyof FormState; label: string; placeholder: string; wide?: boolean; autoComplete: string; max: number }> = [
    { name: 'street', label: 'Street address', placeholder: '42 Park Street', wide: true, autoComplete: 'street-address', max: 255 },
    { name: 'city', label: 'City', placeholder: 'Pune', autoComplete: 'address-level2', max: 100 },
    { name: 'state', label: 'State', placeholder: 'Maharashtra', autoComplete: 'address-level1', max: 100 },
    { name: 'postalCode', label: 'Postal code', placeholder: '411001', autoComplete: 'postal-code', max: 20 },
    { name: 'country', label: 'Country', placeholder: 'India', autoComplete: 'country-name', max: 100 },
  ];

  return (
    <PageShell width="max-w-2xl">
      <PageHeader
        eyebrow={editing ? 'Edit listing' : 'New listing'}
        title={editing ? 'Update your listing' : 'Pass something on'}
      />

      <form onSubmit={submit} className="space-y-8">
        <section className="panel space-y-3 p-6">
          <h2 className="font-semibold">Photos</h2>
          <p className="text-sm text-textMain-secondary">
            {editing ? 'New photos replace the current ones.' : `Up to ${MAX_PHOTOS}. The first one is the cover.`}
          </p>
          <div className="flex flex-wrap gap-3">
            {files.length === 0 &&
              existing?.media.map((media) => (
                <ProductImage key={media.id} src={media.mediaUrl} alt="" className="h-24 w-24 rounded-xl" />
              ))}
            {previews.map((src, index) => (
              <div key={src} className="relative">
                <img src={src} alt={`Photo ${index + 1}`} className="h-24 w-24 rounded-xl object-cover" />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-soft"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {files.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-textMain-secondary transition-colors hover:border-primary hover:text-primary"
              >
                <ImagePlus size={20} />
                <span className="text-xs font-medium">Add photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            id="listing-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={addFiles}
            className="hidden"
          />
        </section>

        <section className="panel space-y-5 p-6">
          <h2 className="font-semibold">Details</h2>
          <Field label="Title" htmlFor="title">
            <input id="title" required maxLength={255} className="field" value={form.title} onChange={set('title')} placeholder="e.g. Canon AE-1 film camera" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <select id="category" className="field" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Condition" htmlFor="condition">
              <select id="condition" className="field" value={form.condition} onChange={set('condition')}>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              required
              rows={5}
              maxLength={5000}
              className="field resize-y"
              value={form.description}
              onChange={set('description')}
              placeholder="Age, any wear or defects, what's included…"
            />
          </Field>
        </section>

        <section className="panel space-y-4 p-6">
          <h2 className="font-semibold">Value</h2>
          <Field label="Credits" htmlFor="credits" hint={`Up to ${MAX_CREDIT_VALUE.toLocaleString()} credits.`}>
            <input id="credits" required type="number" min={1} max={MAX_CREDIT_VALUE} inputMode="numeric" className="field" value={form.credits} onChange={set('credits')} placeholder="150" />
          </Field>
          {value > 0 && (
            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-primary/[0.07] p-4 text-sm">
              <div>
                <dt className="text-textMain-secondary">{editing ? 'Listing reward' : 'You earn now'}</dt>
                <dd className="mt-0.5"><Credits value={reward} /></dd>
              </div>
              <div>
                <dt className="text-textMain-secondary">On handover</dt>
                <dd className="mt-0.5"><Credits value={value - reward} /></dd>
              </div>
              {rewardChange !== 0 && (
                <p className="col-span-2 text-textMain-secondary">
                  Saving this will {rewardChange > 0 ? 'add' : 'take back'} {Math.abs(rewardChange).toLocaleString()} credits{' '}
                  {rewardChange > 0 ? 'to' : 'from'} your wallet.
                </p>
              )}
            </dl>
          )}
        </section>

        <section className="panel space-y-5 p-6">
          <div>
            <h2 className="font-semibold">Pickup address</h2>
            <p className="mt-1 text-sm text-textMain-secondary">
              Only your city and state are public. The buyer sees the full address after reserving.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {inputs.map(({ name, label, placeholder, wide, autoComplete, max }) => (
              <div key={name} className={wide ? 'sm:col-span-2' : ''}>
                <Field label={label} htmlFor={name}>
                  <input id={name} required maxLength={max} autoComplete={autoComplete} className="field" value={form[name]} onChange={set(name)} placeholder={placeholder} />
                </Field>
              </div>
            ))}
          </div>
        </section>

        {error && <Alert>{error}</Alert>}

        <Button id="listing-submit" type="submit" size="lg" className="w-full" loading={isSaving}>
          {editing ? 'Save changes' : 'Publish listing'}
        </Button>
      </form>
    </PageShell>
  );
};

export default ListingForm;
