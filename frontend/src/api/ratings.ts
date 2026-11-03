import { apiClient } from './client';
import type { Page } from './products';

export interface RatingResponse {
  id: number;
  transactionId: number;
  reviewerName: string;
  rating: number;
  review: string | null;
  createdAt: string;
}

export async function submitRating(transactionId: number, rating: number, review: string): Promise<RatingResponse> {
  const res = await apiClient.post<RatingResponse>('/api/ratings', { transactionId, rating, review });
  return res.data;
}

export async function getUserRatings(userId: number, page = 0, size = 5): Promise<Page<RatingResponse>> {
  const res = await apiClient.get<Page<RatingResponse>>(`/api/ratings/user/${userId}`, { params: { page, size } });
  return res.data;
}
