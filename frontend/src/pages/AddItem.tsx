import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Package, AlignLeft, Tag, Coins, Info, ArrowRight } from 'lucide-react';

export const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Electronics',
    condition: 'Good',
    credits: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/listings');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-textMain">Add New Item</h1>
          <p className="text-sm text-textMain-secondary mt-1">
            List your item to earn credits or exchange with others.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl shadow-soft p-6 sm:p-8 space-y-6">
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
                  <option>Electronics</option>
                  <option>Books</option>
                  <option>Clothing</option>
                  <option>Home &amp; Garden</option>
                  <option>Sports</option>
                  <option>Other</option>
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
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
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
                min="0"
                required
                value={form.credits}
                onChange={handleChange}
                placeholder="e.g. 150"
                className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
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
                placeholder="Describe your item in detail..."
                className="block w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <ArrowRight size={16} />
              )}
              {isLoading ? 'Publishing...' : 'List Item'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
