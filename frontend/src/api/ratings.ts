import { apiClient } from './client';
import type { Page } from './products';

export interface RatingRequest {
  transactionId: number;
  revieweeId: number;
  rating: number;
  review?: string;
}

export interface RatingResponse {
  id: number;
  transactionId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  review: string | null;
  createdAt: string;
}

export async function submitRating(request: RatingRequest): Promise<RatingResponse> {
  const res = await apiClient.post<RatingResponse>('/api/ratings', request);
  return res.data;
}

export async function getUserRatings(
  userId: number,
  page = 0,
  size = 10,
): Promise<Page<RatingResponse>> {
  const res = await apiClient.get<Page<RatingResponse>>(`/api/ratings/user/${userId}`, {
    params: { page, size },
  });
  return res.data;
}
