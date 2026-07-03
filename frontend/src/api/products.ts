import { apiClient } from './client';

export type Category =
  | 'ELECTRONICS'
  | 'BOOKS'
  | 'CLOTHING'
  | 'HOME_AND_GARDEN'
  | 'SPORTS'
  | 'MUSIC'
  | 'KITCHEN'
  | 'TOYS'
  | 'VEHICLES'
  | 'OTHER';

export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

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
  imageUrl: string;
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
  createdAt: string;
  status: ProductStatus;
}

export interface ProductDetail {
  id: number;
  ownerId: number;
  ownerName: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  creditValue: number;
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
  const res = await apiClient.get<Page<ProductListItem>>('/api/products/me', {
    params: { page, size },
  });
  return res.data;
}

export async function createProduct(formData: FormData): Promise<ProductDetail> {
  const res = await apiClient.post<ProductDetail>('/api/products', formData, {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}

export async function updateProduct(
  id: number,
  formData: FormData,
): Promise<ProductDetail> {
  const res = await apiClient.put<ProductDetail>(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}
