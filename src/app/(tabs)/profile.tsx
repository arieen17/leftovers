import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { ChefHat, Star, Heart, MessageCircle } from "lucide-react-native";
import ProfilePic from "../../../public/icons/basicProfile.svg";
import { TopBar } from "@/components/TopBar";
import { AppText } from "@/components/AppText";
import { useAuth } from "@/context/AuthContext";
import { getUserReviews, type Review } from "@/services/userService";
import { getCurrentUser } from "@/services/authService";
import { apiRequest } from "@/services/api"; // ADD THIS

interface UserStats {
  xp: number;
  likes_received: number;
}

export default function ProfileScreen() {
  const [isReview, setIsReview] = useState(true);
  const [isBadge, setIsBadge] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ xp: 0, likes_received: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const { user, logout, isAuthenticated, login } = useAuth();
  const router = useRouter();

  // Sync user data when screen comes into focus, but only if it changed
  useFocusEffect(
    useCallback(() => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        if (
          !user ||
          currentUser.id !== user.id ||
          currentUser.name !== user.name ||
          currentUser.email !== user.email
        ) {
          login({ ...currentUser });
        }
      }
    }, [login, user]) // FIXED: Removed unnecessary dependencies
  );

  const loadUserReviews = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const reviews = await getUserReviews(user.id);
      setUserReviews(reviews);
    } catch (error) {
      console.error("Error loading user reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadUserStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingStats(true);
      const stats = await apiRequest<UserStats>(`/api/users/${user.id}/stats`);
      setUserStats(stats);
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  // Load reviews and stats when screen comes into focus (so it's always up-to-date)
  // FIXED: Combined into single useFocusEffect like teammate's version
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user && isReview) {
        loadUserReviews();
        loadUserStats();
      }
    }, [isAuthenticated, user, isReview, loadUserReviews, loadUserStats]) // FIXED: Proper dependencies
  );

  const handleLogout = () => {
    logout();
    router.replace("login");
  };

  const navigateToEditProfile = () => {
    router.push("edit-profile");
  };

  const toggleReview = () => {
    setIsBadge(false);
    setIsFavorite(false);
    setIsReview(true);
  };

  const toggleBadge = () => {
    setIsBadge(true);
    setIsFavorite(false);
    setIsReview(false);
  };

  const toggleFavorite = () => {
    setIsBadge(false);
    setIsFavorite(true);
    setIsReview(false);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours === 1) return "1hr ago";
    return `${diffHours}hr ago`;
  };

  const reviewCount = userReviews.length;
  const totalLikes = userStats.likes_received; // CHANGED: Use actual likes from stats

  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#011A69" />
        <Text className="text-base text-gray-600 mt-4">
          Loading user data...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <TopBar />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative px-4 pt-4">
          <View className="items-center pt-8 pb-4">
            <View className="w-24 h-24 rounded-full overflow-hidden mb-4 items-center justify-center bg-gray-200">
              <ProfilePic width={96} height={96} />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user.name}
            </Text>
            <Text className="text-base text-gray-600 mb-4">{user.email}</Text>

            <View className="flex-row gap-8 mb-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {reviewCount}
                </Text>
                <Text className="text-sm text-gray-600">Reviews</Text>
              </View>
              <View className="items-center">
                {loadingStats ? (
                  <ActivityIndicator size="small" color="#011A69" />
                ) : (
                  <Text className="text-2xl font-bold text-gray-900">
                    {totalLikes}
                  </Text>
                )}
                <Text className="text-sm text-gray-600">Likes</Text>
              </View>
            </View>

            <View className="flex-row gap-3 w-full max-w-xs mb-4">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-1 bg-[#011A69] rounded-lg py-3 px-4 items-center"
              >
                <Text className="text-white font-bold text-sm uppercase">
                  Sign Out
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={navigateToEditProfile}
                className="flex-1 bg-[#011A69] rounded-lg py-3 px-4 items-center"
              >
                <Text className="text-white font-bold text-sm uppercase">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* XP DISPLAY - NEW SECTION */}
          <View className="bg-[#4CAF50] rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <ChefHat size={20} color="#ffffff" />
              <Text className="text-white font-bold text-md ml-2">
                XP Progress
              </Text>
            </View>
            {loadingStats ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <View className="h-3 bg-white/30 rounded-full overflow-hidden mb-1">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: `${Math.min(100, ((userStats.xp || 0) % 1000) / 10)}%` }}
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white text-xs">
                    Level {Math.floor((userStats.xp || 0) / 1000) + 1}
                  </Text>
                  <Text className="text-white text-xs">
                    {userStats.xp || 0} / {(Math.floor((userStats.xp || 0) / 1000) + 1) * 1000} XP
                  </Text>
                </View>
              </>
            )}
          </View>

          <View className="bg-[#295298] rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <ChefHat size={24} color="#ffffff" />
              <Text className="text-white font-bold text-lg ml-2">
                {user.tier} Food Explorer
              </Text>
            </View>
            <View className="h-3 bg-white/30 rounded-full overflow-hidden">
              <View
                className="h-full bg-white rounded-full"
                style={{ width: "75%" }}
              />
            </View>
          </View>

          <View className="w-full bg-[#A1B1E4] flex-row rounded-full justify-center items-center mb-4 py-2 px-2">
            <TouchableOpacity
              onPress={toggleReview}
              className={
                isReview
                  ? "w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4"
                  : "w-[90px] h-6 bg-transparent rounded-full justify-center items-center mr-4"
              }
            >
              <Text className="text-base text-black font-bold">Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleBadge}
              className={
                isBadge
                  ? "w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4"
                  : "w-[90px] h-6 bg-transparent rounded-full justify-center items-center mr-4"
              }
            >
              <Text className="text-base text-black font-bold">Badges</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleFavorite}
              className={
                isFavorite
                  ? "w-[90px] h-6 bg-white rounded-full justify-center items-center"
                  : "w-[90px] h-6 bg-transparent rounded-full justify-center items-center"
              }
            >
              <Text className="text-base text-black font-bold">Favorites</Text>
            </TouchableOpacity>
          </View>

          {isReview && (
            <View className="pb-6">
              {loading ? (
                <View className="bg-[#C2D0FF] rounded-xl p-8 items-center">
                  <ActivityIndicator size="large" color="#011A69" />
                  <Text className="text-gray-600 mt-2">Loading reviews...</Text>
                </View>
              ) : userReviews.length > 0 ? (
                userReviews.map((review) => (
                  <View
                    key={review.id}
                    className="bg-[#C2D0FF] rounded-xl p-5 mb-3"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-2">
                        <AppText
                          size="large"
                          bold
                          className="text-gray-900 mb-1"
                        >
                          {review.menu_item_name || "Menu Item"}
                        </AppText>
                        <AppText size="medium" className="text-gray-600">
                          {review.restaurant_name || "Restaurant"}
                        </AppText>
                      </View>
                      <View className="flex-row items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => i + 1).map(
                          (star) => (
                            <Star
                              key={star}
                              size={16}
                              fill={
                                star <= review.rating
                                  ? "#FFD700"
                                  : "transparent"
                              }
                              color={
                                star <= review.rating ? "#FFD700" : "#D1D5DB"
                              }
                              strokeWidth={2}
                            />
                          )
                        )}
                      </View>
                    </View>

                    {review.comment && (
                      <AppText size="medium" className="text-gray-700 mb-3">
                        {review.comment}
                      </AppText>
                    )}

                    <View className="h-px bg-gray-300 my-3" />

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center">
                          <Heart size={16} fill="#EF4444" color="#EF4444" />
                          <AppText
                            size="small"
                            className="text-gray-700 ml-1 mb-0"
                          >
                            {review.like_count ?? 0}
                          </AppText>
                        </View>
                        <View className="flex-row items-center">
                          <MessageCircle size={16} color="#6B7280" />
                          <AppText
                            size="small"
                            className="text-gray-700 ml-1 mb-0"
                          >
                            {review.comment_count ?? 0}
                          </AppText>
                        </View>
                      </View>
                      <AppText size="small" className="text-gray-500 mb-0">
                        {getTimeAgo(review.created_at)}
                      </AppText>
                    </View>
                  </View>
                ))
              ) : (
                <View className="bg-[#C2D0FF] rounded-xl p-8 items-center">
                  <AppText size="medium" className="text-gray-600 mb-0">
                    No reviews yet
                  </AppText>
                </View>
              )}
            </View>
          )}

          {isBadge && (
            <View className="bg-[#C2D0FF] rounded-xl p-8 items-center mb-6">
              <AppText size="medium" className="text-gray-600 mb-0">
                No badges yet
              </AppText>
            </View>
          )}

          {isFavorite && (
            <View className="pb-6">
              <View className="bg-[#C2D0FF] rounded-xl p-8 items-center mb-3">
                <AppText size="medium" className="text-gray-600 mb-0">
                  No favorites yet
                </AppText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}