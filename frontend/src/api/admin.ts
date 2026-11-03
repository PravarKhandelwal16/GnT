import { apiClient } from './client';
import type { Page, ProductStatus } from './products';
import type { CreditHistoryEntry, UserStatus } from './profile';
import type { TransactionStatus } from './transactions';

export type Role = 'USER' | 'MODERATOR' | 'ADMIN';
export type ReportStatus = 'OPEN' | 'CLOSED';

export interface Overview {
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  newMembersLast7Days: number;
  liveListings: number;
  reservedListings: number;
  exchangedListings: number;
  removedListings: number;
  openExchanges: number;
  completedExchanges: number;
  cancelledOrExpiredExchanges: number;
  creditsInWallets: number;
  creditsHeldInExchanges: number;
  creditsExchangedLast30Days: number;
  openReports: number;
}

export interface MemberRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  creditBalance: number;
  rating: number;
  city: string | null;
  createdAt: string;
}

export interface ListingRow {
  id: number;
  title: string;
  ownerId: number;
  ownerName: string;
  status: ProductStatus;
  creditValue: number;
  listingBonus: number;
  city: string;
  primaryMediaUrl: string | null;
  openReports: number;
  createdAt: string;
}

export interface ExchangeRow {
  id: number;
  productId: number;
  productTitle: string;
  buyerId: number;
  buyerName: string;
  buyerPhone: string;
  sellerId: number;
  sellerName: string;
  sellerPhone: string;
  creditsUsed: number;
  status: TransactionStatus;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  expiresAt: string;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface ReportRow {
  id: number;
  productId: number;
  productTitle: string;
  productStatus: ProductStatus;
  ownerId: number;
  ownerName: string;
  reporterId: number;
  reporterName: string;
  reason: string;
  description: string;
  status: ReportStatus;
  resolutionNote: string | null;
  resolvedByName: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AuditRow {
  id: number;
  actorId: number;
  actorName: string;
  action: string;
  targetType: 'USER' | 'LISTING' | 'EXCHANGE' | 'REPORT';
  targetId: number;
  details: string;
  createdAt: string;
}

type Params = Record<string, string | number | undefined>;

const clean = (params: Params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

export const admin = {
  overview: () => apiClient.get<Overview>('/api/admin/overview').then((r) => r.data),

  members: (params: Params) => apiClient.get<Page<MemberRow>>('/api/admin/users', { params: clean(params) }).then((r) => r.data),
  member: (id: number | string) => apiClient.get<MemberRow>(`/api/admin/users/${id}`).then((r) => r.data),
  memberCredits: (id: number | string, page = 0) =>
    apiClient.get<Page<CreditHistoryEntry>>(`/api/admin/users/${id}/credits`, { params: { page, size: 25 } }).then((r) => r.data),
  suspend: (id: number, reason: string) => apiClient.post<MemberRow>(`/api/admin/users/${id}/suspend`, { reason }).then((r) => r.data),
  reactivate: (id: number, reason: string) =>
    apiClient.post<MemberRow>(`/api/admin/users/${id}/reactivate`, { reason }).then((r) => r.data),
  adjustCredits: (id: number, amount: number, reason: string) =>
    apiClient.post<MemberRow>(`/api/admin/users/${id}/credits`, { amount, reason }).then((r) => r.data),
  changeRole: (id: number, role: Role, reason: string) =>
    apiClient.put<MemberRow>(`/api/admin/users/${id}/role`, { role, reason }).then((r) => r.data),

  listings: (params: Params) => apiClient.get<Page<ListingRow>>('/api/admin/listings', { params: clean(params) }).then((r) => r.data),
  takeDown: (id: number, reason: string) =>
    apiClient.post<ListingRow>(`/api/admin/listings/${id}/take-down`, { reason }).then((r) => r.data),
  restore: (id: number, reason: string) => apiClient.post<ListingRow>(`/api/admin/listings/${id}/restore`, { reason }).then((r) => r.data),

  reports: (params: Params) => apiClient.get<Page<ReportRow>>('/api/admin/reports', { params: clean(params) }).then((r) => r.data),
  resolveReport: (id: number, outcome: 'DISMISS' | 'TAKE_DOWN', note: string) =>
    apiClient.post<ReportRow>(`/api/admin/reports/${id}/resolve`, { outcome, note }).then((r) => r.data),

  exchanges: (params: Params) =>
    apiClient.get<Page<ExchangeRow>>('/api/admin/exchanges', { params: clean(params) }).then((r) => r.data),
  cancelExchange: (id: number, reason: string) =>
    apiClient.post<ExchangeRow>(`/api/admin/exchanges/${id}/cancel`, { reason }).then((r) => r.data),

  addSampleListings: () => apiClient.post<{ created: number }>('/api/admin/sample-listings').then((r) => r.data),

  audit: (params: Params) => apiClient.get<Page<AuditRow>>('/api/admin/audit', { params: clean(params) }).then((r) => r.data),
};
