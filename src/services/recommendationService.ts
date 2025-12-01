import { apiRequest } from "./api";
import { getCurrentUser } from "./authService";
import { fetchMenuItemById, type MenuItem } from "./restaurantService";

export interface Recommendation {
  menu_item_id: number;
  score: number;
}

export interface RecommendationResponse {
  user_id: number;
  recommendations: Recommendation[];
}

/**
 * Get personalized recommendations for current user
 */
export async function getUserRecommendations(
  limit: number = 10,
): Promise<MenuItem[]> {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const response = await apiRequest<RecommendationResponse>(
      `/api/recommendations/user/${currentUser.id}?limit=${limit}`,
    );

    // If no recommendations returned, return empty array (don't fallback)
    if (response.recommendations.length === 0) {
      return [];
    }

    // Fetch full menu item details for each recommendation
    const menuItems = await Promise.all(
      response.recommendations.map(async (rec) => {
        try {
          return await fetchMenuItemById(rec.menu_item_id);
        } catch (error) {
          console.error(`Error fetching menu item ${rec.menu_item_id}:`, error);
          return null;
        }
      }),
    );

    return menuItems.filter((item): item is MenuItem => item !== null);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Don't fallback - return empty array so frontend shows the message
    return [];
  }
}

/**
 * Get popular items across all restaurants
 */
export async function getPopularItems(limit: number = 10): Promise<MenuItem[]> {
  try {
    const response = await apiRequest<MenuItem[]>(
      `/api/menu-items/popular?limit=${limit}`,
    );
    return response;
  } catch (error) {
    console.error("Error fetching popular items:", error);
    // Fallback: fetch some random menu items
    try {
      const allItems = await apiRequest<MenuItem[]>("/api/menu-items");
      return allItems.slice(0, limit);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return [];
    }
  }
}
