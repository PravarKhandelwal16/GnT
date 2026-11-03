import { Armchair, BookOpen, CookingPot, Footprints, Laptop, Shirt, Sparkles, ToyBrick } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* These values mirror the backend enums exactly. */
export const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics', icon: Laptop },
  { value: 'FURNITURE', label: 'Furniture', icon: Armchair },
  { value: 'BOOKS', label: 'Books', icon: BookOpen },
  { value: 'CLOTHES', label: 'Clothes', icon: Shirt },
  { value: 'SHOES', label: 'Shoes', icon: Footprints },
  { value: 'KITCHEN_ITEMS', label: 'Kitchen', icon: CookingPot },
  { value: 'TOYS', label: 'Toys', icon: ToyBrick },
  { value: 'ACCESSORIES', label: 'Accessories', icon: Sparkles },
] as const satisfies ReadonlyArray<{ value: string; label: string; icon: LucideIcon }>;

export type Category = (typeof CATEGORIES)[number]['value'];

export const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Well used' },
] as const;

export type Condition = (typeof CONDITIONS)[number]['value'];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function conditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export const MAX_CREDIT_VALUE = 5000;

/** Mirrors the backend: 40% rounded down on listing, the remainder on completion. */
export function listingReward(creditValue: number): number {
  return Math.floor((creditValue * 40) / 100);
}
