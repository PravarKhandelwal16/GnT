import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  Package,
  AlignLeft,
  Tag,
  Coins,
  Info,
  Upload,
  X,
  MapPin,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createProduct } from '../api/products';

const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'CLOTHES', label: 'Clothes' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'TOYS', label: 'Toys' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'KITCHEN_ITEMS', label: 'Kitchen Items' },
];

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

export const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
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
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - imageFiles.length;
    const toAdd = files.slice(0, remaining);

    const readers = toAdd.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers).then((previews) => {
      setImageFiles((prev) => [...prev, ...toAdd]);
      setImagePreviews((prev) => [...prev, ...previews]);
    });

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setErrorMsg('Please add at least one photo of the item.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = {
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition,
        creditValue: Number(form.credits),
        street: form.street,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      };

      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      imageFiles.forEach((file) => formData.append('files', file));

      await createProduct(formData);
      setSuccess(true);
      setTimeout(() => navigate('/listings'), 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to list the item. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-textMain">Add New Item</h1>
          <p className="text-sm text-textMain-secondary mt-1">
            List your item on the marketplace to earn credits.
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/20 text-success">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Item listed successfully! Redirecting…</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl shadow-soft p-6 sm:p-8 space-y-6"
        >
          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{errorMsg}</span>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">
              Photos <span className="text-textMain-secondary font-normal">(up to 5)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-border shadow-soft group"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-textMain" />
                  </button>
                </div>
              ))}

              {imageFiles.length < 5 && (
                <button
                  type="button"
                  id="add-item-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-background hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 text-textMain-secondary hover:text-primary"
                >
                  <ImagePlus size={22} />
                  <span className="text-[10px] font-medium">Add Photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-textMain mb-1.5">
              Item Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Tag size={16} className="text-textMain-secondary" />
              </div>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Vintage Camera"
                className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-textMain mb-1.5">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Package size={16} className="text-textMain-secondary" />
                </div>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-textMain mb-1.5">
                Condition
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Info size={16} className="text-textMain-secondary" />
                </div>
                <select
                  id="condition"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div>
            <label htmlFor="credits" className="block text-sm font-medium text-textMain mb-1.5">
              Credits Required
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Coins size={16} className="text-textMain-secondary" />
              </div>
              <input
                id="credits"
                name="credits"
                type="number"
                min="1"
                required
                value={form.credits}
                onChange={handleChange}
                placeholder="e.g. 150"
                className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-textMain">Address</h3>
            
            {/* Street */}
            <div>
              <label htmlFor="street" className="block text-xs font-medium text-textMain-secondary mb-1">
                Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin size={16} className="text-textMain-secondary" />
                </div>
                <input
                  id="street"
                  name="street"
                  type="text"
                  required
                  value={form.street}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="block w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label htmlFor="city" className="block text-xs font-medium text-textMain-secondary mb-1">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="block w-full px-4 py-2 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-xs font-medium text-textMain-secondary mb-1">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder="NY"
                  className="block w-full px-4 py-2 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-xs font-medium text-textMain-secondary mb-1">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className="block w-full px-4 py-2 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-xs font-medium text-textMain-secondary mb-1">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={form.country}
                  onChange={handleChange}
                  placeholder="United States"
                  className="block w-full px-4 py-2 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-textMain mb-1.5">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none">
                <AlignLeft size={16} className="text-textMain-secondary" />
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your item in detail — age, defects, accessories included…"
                className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="add-item-submit"
              type="submit"
              disabled={isLoading || success}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : success ? (
                <CheckCircle2 size={16} />
              ) : (
                <Upload size={16} />
              )}
              {isLoading ? 'Publishing…' : success ? 'Listed!' : 'List Item'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
