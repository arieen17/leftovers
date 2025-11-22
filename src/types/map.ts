/**
 * Type definitions for map-related features
 */

import { Restaurant } from "@/services/restaurantService";

export interface RestaurantWithDistance extends Restaurant {
  distance?: number; // Distance in miles from user location
  distanceText?: string; // Formatted distance string
  average_rating?: string | null; // Average rating for the restaurant
}

export interface MapFilters {
  cuisineType: string | null;
  maxDistance: number | null; // in miles
  minRating: number | null; // 1-5
}
