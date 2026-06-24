import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Upload, X, Info } from 'lucide-react';

const CATEGORIES = [
  'Books',
  'Clothes',
  'Shoes',
  'Electronics',
  'Furniture',
  'Toys',
  'Accessories',
  'Kitchen Items',
];

const CONDITIONS = [
  'New with tags',
  'Like new',
  'Good',
  'Fair',
  'Poor',
];

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    description: '',
  });
  
  // Store object URLs for preview
  const [images, setImages] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    // In a real app, this would send data to the backend
    console.log('Submitting:', { ...formData, images, isDraft });
    // Navigate back to dashboard or listings
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-textMain">List an Item</h1>
          <p className="text-sm text-textMain-secondary mt-1">
            Turn your unused items into community credits.
          </p>
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Images Section */}
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-textMain mb-4">Photos</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center text-textMain-secondary hover:text-primary transition-colors"
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Add Photo</span>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <p className="text-xs text-textMain-secondary mt-3 flex items-center gap-1">
              <Info className="w-4 h-4" />
              Upload up to 4 photos. First photo will be the cover.
            </p>
          </div>

          {/* Details Section */}
          <div className="bg-card border border-border rounded-[20px] p-6 shadow-soft space-y-6">
            <h2 className="text-lg font-semibold text-textMain mb-4">Item Details</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-textMain mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Vintage Film Camera"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-textMain mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-textMain mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Select condition</option>
                  {CONDITIONS.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-textMain mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe your item, any wear and tear, and why you're giving it away..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-textMain placeholder-textMain-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => handleSubmit(e, false)}
              disabled={!formData.title || !formData.category || !formData.condition || !formData.description || images.length === 0}
            >
              Submit Item
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
