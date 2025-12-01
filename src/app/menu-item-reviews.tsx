import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { Heart, MessageCircle, Star } from "lucide-react-native";
import { getMenuItemReviews } from "@/services/reviewService";
import { fetchMenuItemById } from "@/services/restaurantService";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { getAuthToken } from "@/services/authService";

interface Review {
  id: number;
  user_id: number;
  menu_item_id: number;
  rating: number;
  comment: string;
  photos: string[];
  created_at: string;
  user_name?: string;
  user_tier?: string;
  like_count?: number;
  comment_count?: number;
  user_liked?: boolean;
}

interface MenuItem {
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

export default function MenuItemReviewsScreen() {
  const { menuItemId } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!menuItemId) return;

    try {
      setLoading(true);
      const id = Array.isArray(menuItemId)
        ? Number(menuItemId[0])
        : Number(menuItemId);

      // Load menu item details
      try {
        const item = await fetchMenuItemById(id);
        setMenuItem(item);
      } catch (error) {
        console.error("Error loading menu item:", error);
      }

      // Load reviews
      const reviewsData = await getMenuItemReviews(id);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [menuItemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLikeReview = async (reviewId: number) => {
    if (!isAuthenticated) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<{
        like_count: number;
        user_liked: boolean;
      }>(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                like_count: response.like_count,
                user_liked: response.user_liked,
              }
            : review,
        ),
      );
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours === 1) {
      return "1h ago";
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  const getUserInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const backMenu = () => {
    router.push("/(tabs)");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FFFBE6]">
        <TopBar />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#295298" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFFBE6]">
      <TopBar />
      <View className="bg-[#C5DCE9] flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={backMenu} className="mr-4">
          <Text className="text-lg text-black">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-black">Home</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {menuItem && (
          <View className="bg-white px-4 py-4 mb-2">
            <View className="flex-row items-start mb-2">
              {menuItem.image_url ? (
                <Image
                  source={{ uri: menuItem.image_url }}
                  className="w-20 h-20 rounded-lg mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 rounded-lg bg-gray-200 mr-3 justify-center items-center">
                  <Text className="text-gray-400 text-xs">No Image</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  {menuItem.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-1">
                  {menuItem.category}
                </Text>
                <Text className="text-base font-semibold text-[#295298]">
                  ${menuItem.price}
                </Text>
              </View>
            </View>
            {menuItem.description && (
              <Text className="text-sm text-gray-700">
                {menuItem.description}
              </Text>
            )}
          </View>
        )}

        <View className="px-4 py-2">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Reviews ({reviews.length})
          </Text>
        </View>

        {reviews.length === 0 ? (
          <View className="px-4 py-8 items-center">
            <Text className="text-gray-500 text-center">
              No reviews yet. Be the first to review this item!
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View
              key={review.id}
              className="bg-white mb-3 mx-4 rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 overflow-hidden justify-center items-center">
                  <Text className="text-sm text-gray-600">
                    {review.user_name ? getUserInitials(review.user_name) : "U"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900">
                    {review.user_name || "User"}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {getTimeAgo(review.created_at)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                    <Star
                      key={star}
                      size={14}
                      fill={star <= review.rating ? "#FFD700" : "transparent"}
                      color={star <= review.rating ? "#FFD700" : "#D1D5DB"}
                      strokeWidth={2}
                    />
                  ))}
                </View>
              </View>

              {review.photos &&
                review.photos.length > 0 &&
                review.photos[0] && (
                  <Image
                    source={{ uri: review.photos[0] }}
                    className="w-full h-[200] rounded-lg mb-3"
                    resizeMode="cover"
                  />
                )}

              {review.comment && (
                <Text className="text-sm text-gray-900 mb-3" numberOfLines={3}>
                  {review.comment}
                </Text>
              )}

              <View className="flex-row items-center pt-2 border-t border-gray-200">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleLikeReview(review.id);
                  }}
                  className="flex-row items-center mr-4"
                  disabled={!isAuthenticated}
                >
                  <Heart
                    size={16}
                    fill={review.user_liked ? "#EF4444" : "transparent"}
                    color={review.user_liked ? "#EF4444" : "#6B7280"}
                  />
                  <Text className="text-sm text-gray-700 ml-1">
                    {review.like_count || 0}
                  </Text>
                </TouchableOpacity>
                <View className="flex-row items-center">
                  <MessageCircle size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-700 ml-1">
                    {review.comment_count || 0}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
