import { apiClient } from './client';
import type { Page, ProductListItem } from './products';

export async function getSavedProducts(page = 0, size = 24): Promise<Page<ProductListItem>> {
  const res = await apiClient.get<Page<ProductListItem>>('/api/saved', { params: { page, size } });
  return res.data;
}

export async function getSavedIds(): Promise<number[]> {
  const res = await apiClient.get<number[]>('/api/saved/ids');
  return res.data;
}

export async function saveProduct(productId: number): Promise<void> {
  await apiClient.put(`/api/saved/${productId}`);
}

export async function unsaveProduct(productId: number): Promise<void> {
  await apiClient.delete(`/api/saved/${productId}`);
}

export async function reportProduct(productId: number, reason: string, description: string): Promise<void> {
  await apiClient.post('/api/reports', { productId, reason, description });
}
