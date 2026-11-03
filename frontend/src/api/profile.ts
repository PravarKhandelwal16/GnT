import { apiClient } from './client';
import type { Page } from './products';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type CreditHistoryType =
  | 'INITIAL_BONUS'
  | 'PRODUCT_APPROVED'
  | 'PRODUCT_PURCHASE'
  | 'PRODUCT_COMPLETED'
  | 'REFUND'
  | 'MANUAL_ADJUSTMENT'
  | 'LISTING_ADJUSTMENT';

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
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  name: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CreditHistoryEntry {
  id: number;
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

export async function updateAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post<UserProfile>('/api/users/me/avatar', formData, {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post('/api/users/me/change-password', { currentPassword, newPassword });
}

export async function getMyCreditHistory(page = 0, size = 20): Promise<Page<CreditHistoryEntry>> {
  const res = await apiClient.get<Page<CreditHistoryEntry>>('/api/users/me/credits', { params: { page, size } });
  return res.data;
}

export async function markWelcomeSeen(): Promise<void> {
  await apiClient.post('/api/users/me/mark-welcome-seen');
}

export async function deleteAccount(password: string): Promise<void> {
  await apiClient.post('/api/users/me/delete', { password });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/api/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post('/api/auth/reset-password', { token, password });
}
