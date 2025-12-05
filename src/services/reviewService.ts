import { apiRequest } from "./api";
import { getAuthToken } from "./authService";

export interface Review {
  id: number;
  user_id: number;
  menu_item_id: number;
  rating: number;
  comment: string;
  photos: string[];
  created_at: string;
  user_name?: string;
  user_tier?: string;
  menu_item_name?: string;
  restaurant_name?: string;
  like_count?: number;
  comment_count?: number;
  user_liked?: boolean;
}

export interface CreateReviewData {
  menu_item_id: number;
  rating: number;
  comment: string;
  photos?: string[];
}

/**
 * Create a new review
 */
export async function createReview(
  reviewData: CreateReviewData
): Promise<Review> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error(
        "User not authenticated. Please log in to create a review."
      );
    }

    const { photos, ...rest } = reviewData;
    const payload = {
      ...rest,
      photos: photos || [],
    };

    const review = await apiRequest<Review>("/api/reviews", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return review;
  } catch (error) {
    console.error("❌ Error creating review:", error);
    if (error instanceof Error && error.message.includes("Invalid token")) {
      throw new Error("Your session has expired. Please log in again.");
    }
    throw error;
  }
}

/**
 * Get a single review by ID
 */
export async function getReviewById(reviewId: number): Promise<Review | null> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // **FIXED: Always include token if available**
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const review = await apiRequest<Review>(`/api/reviews/${reviewId}`, {
      method: 'GET',
      headers,
    });
    
    return review;
  } catch (error) {
    console.error("❌ Error fetching review:", error);
    
    // Check if it's a 404 error (review not found)
    if (error instanceof Error && error.message.includes("404")) {
      console.log(`Review ${reviewId} not found`);
      return null;
    }
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes("401")) {
      console.log("Authentication failed for review fetch");
      // **FIXED: Don't retry without token - return null or re-throw**
      return null;
    }
    
    return null;
  }
}

/**
 * Get reviews for a menu item - **FIXED: Include auth token**
 */
export async function getMenuItemReviews(
  menuItemId: number
): Promise<Review[]> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // **FIXED: Include token for authenticated user data**
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const reviews = await apiRequest<Review[]>(
      `/api/reviews/menu-item/${menuItemId}`,
      {
        method: 'GET',
        headers,
      }
    );
    return reviews;
  } catch (error) {
    console.error("Error fetching menu item reviews:", error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: number): Promise<void> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }

    await apiRequest(`/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}