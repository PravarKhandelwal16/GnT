import { apiClient } from './client';
import type { Page } from './products';

export type TransactionStatus = 'INITIATED' | 'WAITING_CONFIRMATION' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface TransactionResponse {
  id: number;
  productId: number;
  productTitle: string;
  productImageUrl: string | null;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  creditsUsed: number;
  /* Only ever present for the buyer. */
  qrToken: string | null;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  status: TransactionStatus;
  pickupAddress: string | null;
  counterpartPhone: string | null;
  ratedByViewer: boolean;
  expiresAt: string;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

export function isOpen(status: TransactionStatus): boolean {
  return status === 'INITIATED' || status === 'WAITING_CONFIRMATION';
}

export async function initiateTransaction(productId: number): Promise<TransactionResponse> {
  const res = await apiClient.post<TransactionResponse>('/api/transactions/initiate', { productId });
  return res.data;
}

export async function getTransactionById(id: number | string): Promise<TransactionResponse> {
  const res = await apiClient.get<TransactionResponse>(`/api/transactions/${id}`);
  return res.data;
}

export async function cancelTransaction(id: number): Promise<TransactionResponse> {
  const res = await apiClient.post<TransactionResponse>(`/api/transactions/${id}/cancel`);
  return res.data;
}

export async function confirmAsBuyer(qrToken: string): Promise<TransactionResponse> {
  const res = await apiClient.post<TransactionResponse>('/api/transactions/confirm-buyer', { qrToken });
  return res.data;
}

export async function confirmAsSeller(qrToken: string): Promise<TransactionResponse> {
  const res = await apiClient.post<TransactionResponse>('/api/transactions/confirm-seller', { qrToken });
  return res.data;
}

export async function getMyTransactions(page = 0, size = 20): Promise<Page<TransactionResponse>> {
  const res = await apiClient.get<Page<TransactionResponse>>('/api/transactions/me', { params: { page, size } });
  return res.data;
}
