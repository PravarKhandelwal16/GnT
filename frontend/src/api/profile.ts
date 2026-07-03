import { apiClient } from './client';
import type { Page } from './products';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type CreditHistoryType =
  | 'INITIAL_BONUS'
  | 'PRODUCT_APPROVED'
  | 'PRODUCT_PURCHASE'
  | 'PRODUCT_COMPLETED'
  | 'REFUND'
  | 'MANUAL_ADJUSTMENT';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  dateOfBirth: string | null;
  profileImage: string | null;
  creditBalance: number;
  rating: number | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  hasSeenWelcome: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
  profileImage?: string;
}

export interface CreditHistoryEntry {
  id: number;
  userId: number;
  transactionId: number | null;
  amount: number;
  transactionType: CreditHistoryType;
  description: string;
  createdAt: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const res = await apiClient.get<UserProfile>('/api/users/me');
  return res.data;
}

export async function updateMyProfile(data: ProfileUpdateRequest): Promise<UserProfile> {
  const res = await apiClient.put<UserProfile>('/api/users/me', data);
  return res.data;
}

export async function getMyCreditHistory(
  page = 0,
  size = 20,
): Promise<Page<CreditHistoryEntry>> {
  const res = await apiClient.get<Page<CreditHistoryEntry>>('/api/users/me/credits', {
    params: { page, size },
  });
  return res.data;
}

export async function markWelcomeSeen(): Promise<void> {
  await apiClient.post('/api/users/me/mark-welcome-seen');
}

export async function requestAccountDeletionOtp(): Promise<{ otp: string; message: string }> {
  const res = await apiClient.post<{ otp: string; message: string }>('/api/users/me/delete/request-otp');
  return res.data;
}

export async function confirmAccountDeletion(otp: string): Promise<void> {
  await apiClient.delete('/api/users/me/delete', { data: { otp } });
}
