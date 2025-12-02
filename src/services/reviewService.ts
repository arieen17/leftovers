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
  // REMOVED: tags?: string[];
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

    console.log(
      "🔵 Creating review with token:",
      token ? `${token.substring(0, 20)}...` : "NO TOKEN"
    );

    // Remove tags from the data sent to backend since reviews table doesn't have tags column
    const { photos, ...rest } = reviewData;
    const payload = {
      ...rest,
      photos: photos || [],
    };

    const review = await apiRequest<Review>("/api/reviews", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("✅ Review created successfully:", review);
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
export async function getReviewById(reviewId: number): Promise<Review> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const url = `/api/reviews/${reviewId}`;
    console.log(`🔵 Fetching review from: ${url}`);
    const review = await apiRequest<Review>(url, {
      headers,
    });
    console.log(`✅ Successfully fetched review:`, review);
    return review;
  } catch (error) {
    console.error("❌ Error fetching review:", error);
    throw error;
  }
}

/**
 * Get reviews for a menu item
 */
export async function getMenuItemReviews(
  menuItemId: number
): Promise<Review[]> {
  try {
    const reviews = await apiRequest<Review[]>(
      `/api/reviews/menu-item/${menuItemId}`
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
      },
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}