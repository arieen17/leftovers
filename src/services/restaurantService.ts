import { apiRequest, API_CONFIG } from "./api";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  cuisine_type: string;
  hours: Record<string, string>;
  image_url: string | null;
  created_at: string;
  average_rating?: string | null;
  review_count?: number;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string | null;
  tags: string[];
  created_at: string;
  average_rating: string;
  review_count: string;
}

/**
 * Fetch all restaurants from the database
 * Ratings will be fetched separately if needed, or included if backend provides them
 */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const restaurants = await apiRequest<Restaurant[]>(
      API_CONFIG.ENDPOINTS.RESTAURANTS,
    );
    // Ensure restaurants have rating fields (may be undefined if not provided)
    return restaurants.map((restaurant) => ({
      ...restaurant,
      average_rating: restaurant.average_rating ?? null,
      review_count: restaurant.review_count ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
}

/**
 * Fetch a single restaurant by ID
 */
export async function fetchRestaurantById(id: number): Promise<Restaurant> {
  try {
    const restaurant = await apiRequest<Restaurant>(
      `${API_CONFIG.ENDPOINTS.RESTAURANTS}/${id}`,
    );
    return restaurant;
  } catch (error) {
    console.error(`Error fetching restaurant ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch menu items for a specific restaurant
 */
export async function fetchRestaurantMenu(
  restaurantId: number,
): Promise<MenuItem[]> {
  try {
    const menuItems = await apiRequest<MenuItem[]>(
      API_CONFIG.ENDPOINTS.RESTAURANT_MENU(restaurantId),
    );
    return menuItems;
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${restaurantId}:`, error);
    throw error;
  }
}

/**
 * Fetch a single menu item by ID
 */
export async function fetchMenuItemById(id: number): Promise<MenuItem> {
  try {
    const menuItem = await apiRequest<MenuItem>(
      API_CONFIG.ENDPOINTS.MENU_ITEM(id),
    );
    return menuItem;
  } catch (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    throw error;
  }
}

/**
 * Search restaurants and menu items
 */
export interface SearchResults {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
}

export async function searchRestaurantsAndItems(
  query: string,
): Promise<SearchResults> {
  try {
    const results = await apiRequest<SearchResults>(
      `${API_CONFIG.ENDPOINTS.RESTAURANTS}/search?q=${encodeURIComponent(query)}`,
    );
    return results;
  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
}

/**
 * Check if backend is healthy and connected to database
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiRequest<{ status: string; timestamp: string }>(
      API_CONFIG.ENDPOINTS.HEALTH,
    );
    return response.status.includes("✅");
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}
