import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  MapPin,
  Navigation,
  Filter,
  X,
  Star,
  ChevronRight,
  ExternalLink,
} from "lucide-react-native";

import { TopBar } from "@/components/TopBar";
import {
  fetchRestaurants,
  fetchRestaurantById,
} from "@/services/restaurantService";
import {
  calculateDistance,
  formatDistance,
  Coordinates,
} from "@/utils/locationUtils";
import { RestaurantWithDistance, MapFilters } from "@/types/map";

export default function MapScreen() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<
    RestaurantWithDistance[]
  >([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mapUrl, setMapUrl] = useState<string>("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantWithDistance | null>(null);
  const [showRestaurantDetails, setShowRestaurantDetails] = useState(false);
  const [restaurantDetails, setRestaurantDetails] =
    useState<RestaurantWithDistance | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [filters, setFilters] = useState<MapFilters>({
    cuisineType: null,
    maxDistance: null,
    minRating: null,
  });

  const cuisineTypes = Array.from(
    new Set(restaurants.map((r) => r.cuisine_type).filter(Boolean)),
  ).sort();

  const defaultCenter = { latitude: 33.9745, longitude: -117.3281 };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [restaurants, filters, userLocation]);

  useEffect(() => {
    generateMapURL(selectedRestaurant || undefined);
  }, [filteredRestaurants, userLocation, selectedRestaurant]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        getCurrentLocation();
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await fetchRestaurants();

      const restaurantsWithDistance = data.map(
        (restaurant): RestaurantWithDistance => {
          let distance: number | undefined;
          let distanceText: string | undefined;

          if (userLocation && restaurant.latitude && restaurant.longitude) {
            const restaurantCoords: Coordinates = {
              latitude: parseFloat(restaurant.latitude),
              longitude: parseFloat(restaurant.longitude),
            };
            distance = calculateDistance(userLocation, restaurantCoords);
            distanceText = formatDistance(distance);
          }

          return {
            ...restaurant,
            distance,
            distanceText,
            average_rating: restaurant.average_rating ?? null,
          };
        },
      );

      setRestaurants(restaurantsWithDistance);
    } catch (error) {
      console.error("Error loading restaurants:", error);
      Alert.alert("Error", "Failed to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...restaurants];

    if (filters.cuisineType) {
      filtered = filtered.filter((r) => r.cuisine_type === filters.cuisineType);
    }

    if (filters.maxDistance !== null && userLocation) {
      filtered = filtered.filter(
        (r) => r.distance !== undefined && r.distance <= filters.maxDistance!,
      );
    }

    if (filters.minRating !== null) {
      filtered = filtered.filter((r) => {
        const rating = parseFloat(r.average_rating || "0");
        return rating >= filters.minRating!;
      });
    }

    setFilteredRestaurants(filtered);

    if (
      selectedRestaurant &&
      !filtered.find((r) => r.id === selectedRestaurant.id)
    ) {
      setSelectedRestaurant(null);
    }
  };

  const generateMapURL = (centerOnRestaurant?: RestaurantWithDistance) => {
    if (
      centerOnRestaurant &&
      centerOnRestaurant.latitude &&
      centerOnRestaurant.longitude
    ) {
      const lat = parseFloat(centerOnRestaurant.latitude);
      const lng = parseFloat(centerOnRestaurant.longitude);
      const name = encodeURIComponent(centerOnRestaurant.name);
      const url = `https://www.google.com/maps?q=${name}+@${lat},${lng}&z=16`;
      setMapUrl(url);
      return;
    }

    if (filteredRestaurants.length === 0) {
      const center = userLocation || defaultCenter;
      const url = `https://www.google.com/maps?q=${center.latitude},${center.longitude}&z=15`;
      setMapUrl(url);
      return;
    }

    const center = userLocation || defaultCenter;
    const markers = filteredRestaurants
      .filter((r) => r.latitude && r.longitude)
      .map((r) => `${parseFloat(r.latitude)},${parseFloat(r.longitude)}`)
      .join("|");

    if (markers) {
      const url = `https://www.google.com/maps?q=${center.latitude},${center.longitude}&z=14&markers=${markers}`;
      setMapUrl(url);
    } else {
      const url = `https://www.google.com/maps?q=${center.latitude},${center.longitude}&z=15`;
      setMapUrl(url);
    }
  };

  const handleRestaurantPress = (restaurant: RestaurantWithDistance) => {
    setSelectedRestaurant(restaurant);
    generateMapURL(restaurant);
  };

  const handleViewDetails = async (restaurant: RestaurantWithDistance) => {
    setLoadingDetails(true);
    setShowRestaurantDetails(true);

    try {
      const details = await fetchRestaurantById(restaurant.id);
      let distance: number | undefined;
      let distanceText: string | undefined;

      if (userLocation && details.latitude && details.longitude) {
        const restaurantCoords: Coordinates = {
          latitude: parseFloat(details.latitude),
          longitude: parseFloat(details.longitude),
        };
        distance = calculateDistance(userLocation, restaurantCoords);
        distanceText = formatDistance(distance);
      }

      setRestaurantDetails({
        ...details,
        distance,
        distanceText,
        average_rating: details.average_rating ?? null,
      });
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      setRestaurantDetails(restaurant);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openInGoogleMaps = () => {
    if (mapUrl) {
      Linking.openURL(mapUrl);
    }
  };

  const clearFilters = () => {
    setFilters({
      cuisineType: null,
      maxDistance: null,
      minRating: null,
    });
  };

  const hasActiveFilters =
    filters.cuisineType || filters.maxDistance || filters.minRating;

  return (
    <View className="flex-1 bg-blue">
      <TopBar />

      <View className="h-3/5">
        {selectedRestaurant && (
          <View className="bg-light-blue px-4 py-3 border-b border-gray-300 flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-gray-900 font-bold text-base mb-1">
                {selectedRestaurant.name}
              </Text>
              <Text className="text-gray-700 text-sm" numberOfLines={1}>
                {selectedRestaurant.address}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedRestaurant(null);
                generateMapURL();
              }}
              className="p-1"
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        )}
        {mapUrl ? (
          <WebView
            key={mapUrl}
            source={{ uri: mapUrl }}
            style={{ flex: 1 }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView error: ", nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView HTTP error: ", nativeEvent);
            }}
          />
        ) : (
          <View className="flex-1 bg-gray-200 justify-center items-center">
            <MapPin size={48} color="#1E40AF" />
            <Text className="mt-4 text-base text-gray-700">Loading map...</Text>
          </View>
        )}

        <View className="absolute top-4 right-4 gap-2">
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`bg-white rounded-full p-3 shadow-lg ${
              showFilters ? "bg-blue-600" : ""
            }`}
          >
            <Filter size={20} color={showFilters ? "#ffffff" : "#1E40AF"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openInGoogleMaps}
            className="bg-white rounded-full p-3 shadow-lg"
          >
            <ExternalLink size={20} color="#1E40AF" />
          </TouchableOpacity>

          {locationPermission && (
            <TouchableOpacity
              onPress={getCurrentLocation}
              className="bg-white rounded-full p-3 shadow-lg"
            >
              <Navigation size={20} color="#1E40AF" />
            </TouchableOpacity>
          )}
        </View>

        {showFilters && (
          <View className="absolute top-16 right-4 left-4 bg-white rounded-lg p-4 shadow-xl max-h-96">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-80">
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Cuisine Type
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() =>
                      setFilters({ ...filters, cuisineType: null })
                    }
                    className={`mr-2 px-4 py-2 rounded-full ${
                      !filters.cuisineType ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={
                        !filters.cuisineType
                          ? "text-white font-semibold"
                          : "text-gray-700"
                      }
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {cuisineTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() =>
                        setFilters({ ...filters, cuisineType: type })
                      }
                      className={`mr-2 px-4 py-2 rounded-full ${
                        filters.cuisineType === type
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={
                          filters.cuisineType === type
                            ? "text-white font-semibold"
                            : "text-gray-700"
                        }
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Max Distance
                  {filters.maxDistance ? `(${filters.maxDistance} mi)` : ""}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 5, 10, null].map((distance) => (
                    <TouchableOpacity
                      key={distance || "all"}
                      onPress={() =>
                        setFilters({ ...filters, maxDistance: distance })
                      }
                      className={`mr-2 px-4 py-2 rounded-full ${
                        filters.maxDistance === distance
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={
                          filters.maxDistance === distance
                            ? "text-white font-semibold"
                            : "text-gray-700"
                        }
                      >
                        {distance ? `${distance} mi` : "All"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Min Rating
                  {filters.minRating ? `(${filters.minRating}+ ⭐)` : ""}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[null, 3, 3.5, 4, 4.5].map((rating) => (
                    <TouchableOpacity
                      key={rating || "all"}
                      onPress={() =>
                        setFilters({ ...filters, minRating: rating })
                      }
                      className={`mr-2 px-4 py-2 rounded-full ${
                        filters.minRating === rating
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={
                          filters.minRating === rating
                            ? "text-white font-semibold"
                            : "text-gray-700"
                        }
                      >
                        {rating ? `${rating}+ ⭐` : "All"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={clearFilters}
                  className="mt-2 bg-red-500 rounded-lg py-2 px-4"
                >
                  <Text className="text-white text-center font-semibold">
                    Clear All Filters
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="h-1/4 bg-white border-t border-gray-200 pb-2">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-900">
            Restaurants ({filteredRestaurants.length})
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color="#1E40AF" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 8 }}
        >
          {filteredRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              onPress={() => handleRestaurantPress(restaurant)}
              className={`w-80 bg-white rounded-lg p-3 mx-2 border-2 shadow-sm ${
                selectedRestaurant?.id === restaurant.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <Text className="text-sm font-bold text-gray-900 mb-0.5">
                {restaurant.name}
              </Text>
              <Text className="text-xs text-gray-600 mb-1" numberOfLines={1}>
                {restaurant.address}
              </Text>

              <View className="flex-row items-center gap-1.5 mb-1 flex-wrap">
                {restaurant.average_rating && (
                  <View className="flex-row items-center">
                    <Star size={10} color="#f59e0b" fill="#f59e0b" />
                    <Text className="text-xs text-gray-700 ml-0.5">
                      {parseFloat(restaurant.average_rating).toFixed(1)}
                    </Text>
                  </View>
                )}
                {restaurant.distanceText && (
                  <Text className="text-xs text-gray-700">
                    {restaurant.distanceText}
                  </Text>
                )}
                {restaurant.cuisine_type && (
                  <Text className="text-xs text-blue-600">
                    {restaurant.cuisine_type}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleViewDetails(restaurant);
                }}
                className="w-full bg-blue-600 rounded-lg py-1.5 px-2 flex-row items-center justify-center mt-1"
              >
                <Text className="text-white font-semibold text-xs mr-0.5">
                  View
                </Text>
                <ChevronRight size={12} color="#ffffff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showRestaurantDetails && (
        <View className="absolute inset-0 bg-black/50 justify-center">
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setShowRestaurantDetails(false)}
            activeOpacity={1}
          />
          <View className="bg-white rounded-3xl h-1/2 shadow-2xl mx-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-2 mb-2" />

            {loadingDetails ? (
              <View className="p-6 items-center justify-center min-h-64">
                <ActivityIndicator size="large" color="#1E40AF" />
                <Text className="mt-4 text-gray-600">Loading details...</Text>
              </View>
            ) : restaurantDetails ? (
              <ScrollView className="flex-1 px-6 pb-6">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                      {restaurantDetails.name}
                    </Text>
                    <Text className="text-base text-gray-600">
                      {restaurantDetails.address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowRestaurantDetails(false)}
                    className="p-2"
                  >
                    <X size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <View className="gap-3 mb-4">
                  <View className="flex-row gap-3">
                    {restaurantDetails.average_rating && (
                      <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <View className="flex-row items-center mb-1">
                          <Star size={20} color="#f59e0b" fill="#f59e0b" />
                          <Text className="text-lg font-bold text-gray-900 ml-2">
                            {parseFloat(
                              restaurantDetails.average_rating,
                            ).toFixed(1)}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-600">
                          Average Rating
                        </Text>
                      </View>
                    )}

                    {restaurantDetails.cuisine_type && (
                      <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-200">
                        <Text className="text-lg font-bold text-gray-900 mb-1">
                          {restaurantDetails.cuisine_type}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Cuisine Type
                        </Text>
                      </View>
                    )}
                  </View>

                  {restaurantDetails.distanceText && (
                    <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <View className="flex-row items-center mb-1">
                        <MapPin size={20} color="#1E40AF" />
                        <Text className="text-lg font-bold text-gray-900 ml-2">
                          {restaurantDetails.distanceText}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-600">
                        Distance from you
                      </Text>
                    </View>
                  )}
                </View>

                {restaurantDetails.hours &&
                  Object.keys(restaurantDetails.hours).length > 0 && (
                    <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                      <Text className="text-lg font-bold text-gray-900 mb-3">
                        Hours
                      </Text>
                      {Object.entries(restaurantDetails.hours).map(
                        ([day, hours]) => (
                          <View
                            key={day}
                            className="flex-row justify-between py-1"
                          >
                            <Text className="text-sm font-semibold text-gray-700 capitalize">
                              {day}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              {hours}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  )}
              </ScrollView>
            ) : (
              <View className="p-6 items-center justify-center min-h-64">
                <Text className="text-gray-600">
                  Unable to load restaurant details
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
