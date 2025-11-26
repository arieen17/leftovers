import { apiRequest } from "./api";
import { getAuthToken, getCurrentUser } from "./authService";

export interface Review {
  id: number;
  user_id: number;
  menu_item_id: number;
  rating: number;
  comment: string;
  photos: string[];
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_tier?: string;
  menu_item_name?: string;
  restaurant_name?: string;
}

/**
 * Get user's reviews
 */
export async function getUserReviews(userId: number): Promise<Review[]> {
  try {
    const token = getAuthToken();
    const reviews = await apiRequest<Review[]>(
      `/api/reviews/user/${userId}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return reviews;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
}

/**
 * Get current user's data
 */
export function getCurrentUserData() {
  return getCurrentUser();
}
