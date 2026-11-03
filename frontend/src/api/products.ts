import { apiClient } from './client';
import type { Category, Condition } from '../lib/catalog';

export type { Category, Condition };

export type ProductStatus =
  | 'DRAFT'
  | 'PENDING_AI_REVIEW'
  | 'ACTIVE'
  | 'LOCKED'
  | 'EXCHANGED'
  | 'REJECTED'
  | 'DELETED';

export interface ProductMedia {
  id: number;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductListItem {
  id: number;
  title: string;
  category: Category;
  condition: Condition;
  creditValue: number;
  primaryMediaUrl: string | null;
  city: string;
  state: string;
  createdAt: string;
  status: ProductStatus;
}

export interface ProductDetail {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerRating: number;
  ownerImage: string | null;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  creditValue: number;
  /* Only returned to the owner and to the buyer of the item. */
  listingBonus: number | null;
  street: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  sellerPhone: string | null;
  status: ProductStatus;
  media: ProductMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  creditValue: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface GetProductsParams {
  category?: Category;
  condition?: Condition;
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getProducts(params: GetProductsParams = {}): Promise<Page<ProductListItem>> {
  const res = await apiClient.get<Page<ProductListItem>>('/api/products', { params });
  return res.data;
}

export async function getProductById(id: number | string): Promise<ProductDetail> {
  const res = await apiClient.get<ProductDetail>(`/api/products/${id}`);
  return res.data;
}

export async function getMyProducts(page = 0, size = 20): Promise<Page<ProductListItem>> {
  const res = await apiClient.get<Page<ProductListItem>>('/api/products/me', { params: { page, size } });
  return res.data;
}

function toFormData(input: ProductInput, files: File[]): FormData {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(input)], { type: 'application/json' }));
  files.forEach((file) => formData.append('files', file));
  return formData;
}

export async function createProduct(input: ProductInput, files: File[]): Promise<ProductDetail> {
  const res = await apiClient.post<ProductDetail>('/api/products', toFormData(input, files), {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}

export async function updateProduct(id: number, input: ProductInput, files: File[]): Promise<ProductDetail> {
  const res = await apiClient.put<ProductDetail>(`/api/products/${id}`, toFormData(input, files), {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}
