import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ChefHat,
  Star,
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import ProfilePic from "../../../public/icons/basicProfile.svg";
import YoungGrubber from "../../../public/tiers/youngGrubber.svg";
import FeastFinder from "../../../public/tiers/feastFinder.svg";
import TrailblazingTaster from "../../../public/tiers/trailblazingTaster.svg";
import HoneyConnoisseur from "../../../public/tiers/honeyConnoisseur.svg";
import BearCritic from "../../../public/tiers/bearCritic.svg";
import { TopBar } from "@/components/TopBar";
import { AppText } from "@/components/AppText";
import { useAuth } from "@/context/AuthContext";
import { getUserReviews, type Review } from "@/services/userService";
import { getCurrentUser, getAuthToken } from "@/services/authService";
import { apiRequest } from "@/services/api";

interface UserStats {
  xp: number;
  likes_received: number;
}

interface Comment {
  id: number;
  user_id: number;
  review_id: number;
  comment: string;
  created_at: string;
  user_name?: string;
  user_tier?: string;
  like_count?: number;
  user_liked?: boolean;
}

export default function ProfileScreen() {
  const [isReview, setIsReview] = useState(true);
  const [isBadge, setIsBadge] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    likes_received: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Like/Comment state
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [loadingComments, setLoadingComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [likingReview, setLikingReview] = useState<number | null>(null);
  const [likingComment, setLikingComment] = useState<number | null>(null);

  const { user, logout, isAuthenticated, login } = useAuth();
  const router = useRouter();

  const labels: Record<number, string> = {
    0: "Young Grubber",
    1: "Feast Finder",
    2: "Trailblazing Taster",
    3: "Honey Connoisseur",
    4: "Supreme Bear Critic",
  };

  // Calculate rank based on XP/level
  const getRankFromXP = (xp: number): number => {
    const level = Math.floor(xp / 1000) + 1;
    if (level <= 2) return 0; // Young Grubber
    if (level <= 4) return 1; // Feast Finder
    if (level <= 6) return 2; // Trailblazing Taster
    if (level <= 8) return 3; // Honey Connoisseur
    return 4; // Supreme Bear Critic
  };

  // Sync user data when screen comes into focus
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
    }, [login, user]),
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

  // Load reviews and stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user && isReview) {
        loadUserReviews();
        loadUserStats();
      }
    }, [isAuthenticated, user, isReview, loadUserReviews, loadUserStats]),
  );

  const toggleReviewExpansion = async (reviewId: number) => {
    if (expandedReview === reviewId) {
      setExpandedReview(null);
    } else {
      setExpandedReview(reviewId);
      await loadCommentsForReview(reviewId);
    }
  };

  const loadCommentsForReview = async (reviewId: number) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: true }));
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiRequest<Comment[]>(
        `/api/reviews/${reviewId}/comments`,
        {
          method: "GET",
          headers,
        },
      );
      setComments((prev) => ({ ...prev, [reviewId]: response || [] }));
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments((prev) => ({ ...prev, [reviewId]: [] }));
    } finally {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleLikeReview = async (reviewId: number) => {
    if (!isAuthenticated || likingReview === reviewId) return;

    try {
      setLikingReview(reviewId);
      const token = getAuthToken();
      if (!token) return;

      // Get current state
      const currentReview = userReviews.find((r) => r.id === reviewId);
      const isCurrentlyLiked = currentReview?.user_liked || false;

      // Always use POST with action parameter
      const action = isCurrentlyLiked ? "unlike" : "like";

      const response = await apiRequest<any>(
        `/api/reviews/${reviewId}/like?action=${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update the specific review in state directly
      setUserReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                like_count: response.like_count || 0,
                user_liked: response.user_liked || false,
              }
            : review,
        ),
      );
    } catch (error) {
      console.error("Error liking/unliking review:", error);
    } finally {
      setLikingReview(null);
    }
  };

  const handleLikeComment = async (commentId: number, reviewId: number) => {
    if (!isAuthenticated || likingComment === commentId) return;

    try {
      setLikingComment(commentId);
      const token = getAuthToken();
      if (!token) return;

      // Get current state
      const currentComment = comments[reviewId]?.find(
        (c) => c.id === commentId,
      );
      const isCurrentlyLiked = currentComment?.user_liked || false;

      // Always use POST with action parameter
      const action = isCurrentlyLiked ? "unlike" : "like";

      const response = await apiRequest<any>(
        `/api/reviews/comments/${commentId}/like?action=${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update the specific comment in state directly
      setComments((prev) => ({
        ...prev,
        [reviewId]:
          prev[reviewId]?.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  like_count: response.like_count || 0,
                  user_liked: response.user_liked || false,
                }
              : comment,
          ) || [],
      }));
    } catch (error) {
      console.error("Error liking/unliking comment:", error);
    } finally {
      setLikingComment(null);
    }
  };

  const handleAddComment = async (reviewId: number) => {
    if (!isAuthenticated || !newComments[reviewId]?.trim()) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<any>(
        `/api/reviews/${reviewId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: newComments[reviewId].trim() }),
        },
      );

      setNewComments((prev) => ({ ...prev, [reviewId]: "" }));

      // Add the new comment to state
      setComments((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), response],
      }));

      // Update review comment count
      setUserReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                comment_count:
                  response.comment_count || (review.comment_count || 0) + 1,
              }
            : review,
        ),
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

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
    return `${diffHours} hr ago`;
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const reviewCount = userReviews.length;
  const totalLikes = userStats.likes_received;
  const currentRank = getRankFromXP(userStats.xp || 0);

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

          {/* XP DISPLAY WITH RANK */}
          <View className="bg-[#76abc7] rounded-xl p-4 mb-4 relative">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <ChefHat size={20} color="#ffffff" />
                <Text className="text-white font-bold text-md ml-2">
                  {loadingStats ? "Loading..." : labels[currentRank]}
                </Text>
              </View>
              <View>
                {currentRank === 0 && <YoungGrubber width={32} height={32} />}
                {currentRank === 1 && <FeastFinder width={32} height={32} />}
                {currentRank === 2 && (
                  <TrailblazingTaster width={32} height={32} />
                )}
                {currentRank === 3 && (
                  <HoneyConnoisseur width={32} height={32} />
                )}
                {currentRank >= 4 && <BearCritic width={32} height={32} />}
              </View>
            </View>
            {loadingStats ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <View className="h-3 bg-white/30 rounded-full overflow-hidden mb-1">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{
                      width: `${Math.min(100, ((userStats.xp || 0) % 1000) / 10)}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white text-xs">
                    Level {Math.floor((userStats.xp || 0) / 1000) + 1}
                  </Text>
                  <Text className="text-white text-xs">
                    {userStats.xp || 0} /{" "}
                    {(Math.floor((userStats.xp || 0) / 1000) + 1) * 1000} XP
                  </Text>
                </View>
              </>
            )}
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
                userReviews.map((review) => {
                  const isExpanded = expandedReview === review.id;
                  const reviewComments = comments[review.id] || [];
                  const commentCount =
                    review.comment_count || reviewComments.length || 0;

                  return (
                    <View
                      key={review.id}
                      className="bg-[#C2D0FF] rounded-xl p-5 mb-3 border border-gray-200"
                    >
                      {/* Review Header */}
                      <TouchableOpacity
                        onPress={() => toggleReviewExpansion(review.id)}
                      >
                        <View className="flex-row justify-between items-start mb-3">
                          <View className="flex-1 mr-2">
                            <Text className="text-lg font-bold text-gray-900 mb-1">
                              {review.menu_item_name || "Menu Item"}
                            </Text>
                            <Text className="text-base text-gray-600">
                              {review.restaurant_name || "Restaurant"}
                            </Text>
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
                                    star <= review.rating
                                      ? "#FFD700"
                                      : "#D1D5DB"
                                  }
                                  strokeWidth={2}
                                />
                              ),
                            )}
                          </View>
                        </View>

                        {review.comment && (
                          <Text className="text-base text-gray-700 mb-3">
                            {review.comment}
                          </Text>
                        )}

                        {/* Like/Comment/Time Row */}
                        <View className="flex-row justify-between items-center mt-2">
                          <View className="flex-row items-center space-x-3">
                            <TouchableOpacity
                              className="flex-row items-center"
                              onPress={() => handleLikeReview(review.id)}
                              disabled={
                                !isAuthenticated || likingReview === review.id
                              }
                            >
                              {likingReview === review.id ? (
                                <ActivityIndicator size={14} color="#EF4444" />
                              ) : (
                                <Heart
                                  size={16}
                                  fill={
                                    review.user_liked
                                      ? "#EF4444"
                                      : "transparent"
                                  }
                                  color={
                                    review.user_liked ? "#EF4444" : "#6B7280"
                                  }
                                />
                              )}
                              <Text className="text-sm text-gray-600 ml-1">
                                {review.like_count || 0}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className="flex-row items-center"
                              onPress={() => toggleReviewExpansion(review.id)}
                            >
                              <MessageCircle size={16} color="#6B7280" />
                              <Text className="text-sm text-gray-600 ml-1">
                                {commentCount}
                              </Text>
                              <View className="ml-2">
                                {isExpanded ? (
                                  <ChevronUp size={14} color="#6B7280" />
                                ) : (
                                  <ChevronDown size={14} color="#6B7280" />
                                )}
                              </View>
                            </TouchableOpacity>
                          </View>
                          <Text className="text-sm text-gray-500">
                            {getTimeAgo(review.created_at)}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Expanded Comments Section */}
                      {isExpanded && (
                        <View className="mt-4 border-t border-gray-300 pt-3">
                          {loadingComments[review.id] ? (
                            <ActivityIndicator size="small" color="#295298" />
                          ) : (
                            <>
                              {/* Comments List */}
                              {reviewComments.length > 0 ? (
                                <View className="mb-3">
                                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                                    Comments ({reviewComments.length})
                                  </Text>
                                  {reviewComments.map((comment) => (
                                    <View
                                      key={comment.id}
                                      className="mb-3 pb-2 border-b border-gray-200 last:border-0"
                                    >
                                      <View className="flex-row">
                                        <View className="w-8 h-8 rounded-full bg-yellow-200 mr-3 justify-center items-center">
                                          <Text className="text-xs text-gray-700">
                                            {getUserInitials(comment.user_name)}
                                          </Text>
                                        </View>
                                        <View className="flex-1">
                                          <View className="flex-row justify-between items-start mb-1">
                                            <Text className="text-sm font-bold text-gray-900">
                                              {comment.user_name || "User"}
                                            </Text>
                                            <Text className="text-xs text-gray-500">
                                              {getTimeAgo(comment.created_at)}
                                            </Text>
                                          </View>
                                          <Text className="text-sm text-gray-700 mb-2">
                                            {comment.comment}
                                          </Text>
                                          <View className="flex-row items-center">
                                            <TouchableOpacity
                                              className="flex-row items-center"
                                              onPress={() =>
                                                handleLikeComment(
                                                  comment.id,
                                                  review.id,
                                                )
                                              }
                                              disabled={
                                                !isAuthenticated ||
                                                likingComment === comment.id
                                              }
                                            >
                                              {likingComment === comment.id ? (
                                                <ActivityIndicator
                                                  size={12}
                                                  color="#EF4444"
                                                />
                                              ) : (
                                                <Heart
                                                  size={14}
                                                  fill={
                                                    comment.user_liked
                                                      ? "#EF4444"
                                                      : "transparent"
                                                  }
                                                  color={
                                                    comment.user_liked
                                                      ? "#EF4444"
                                                      : "#6B7280"
                                                  }
                                                />
                                              )}
                                              <Text className="text-xs text-gray-500 ml-1">
                                                {comment.like_count || 0}
                                              </Text>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                  ))}
                                </View>
                              ) : (
                                <View className="py-3 items-center">
                                  <Text className="text-gray-500 text-sm">
                                    No comments yet
                                  </Text>
                                  <Text className="text-gray-400 text-xs mt-1">
                                    Be the first to comment!
                                  </Text>
                                </View>
                              )}

                              {/* Add Comment Input */}
                              {isAuthenticated && (
                                <View className="flex-row items-center mt-2">
                                  <View className="w-8 h-8 rounded-full bg-yellow-200 mr-3 justify-center items-center">
                                    <Text className="text-xs text-gray-700">
                                      {getUserInitials(user?.name)}
                                    </Text>
                                  </View>
                                  <View className="flex-1 flex-row items-center border border-gray-400 rounded-full px-3 py-2">
                                    <TextInput
                                      className="flex-1 text-sm"
                                      placeholder="Add a comment..."
                                      value={newComments[review.id] || ""}
                                      onChangeText={(text) =>
                                        setNewComments((prev) => ({
                                          ...prev,
                                          [review.id]: text,
                                        }))
                                      }
                                      placeholderTextColor="#9CA3AF"
                                      multiline
                                      maxLength={500}
                                      onSubmitEditing={() =>
                                        handleAddComment(review.id)
                                      }
                                    />
                                    <TouchableOpacity
                                      className={`ml-2 rounded-full p-2 ${newComments[review.id]?.trim() ? "bg-[#295298]" : "bg-gray-300"}`}
                                      onPress={() =>
                                        handleAddComment(review.id)
                                      }
                                      disabled={!newComments[review.id]?.trim()}
                                    >
                                      <Send size={14} color="#FFFFFF" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              )}

                              {/* Hide Comments Button */}
                              <TouchableOpacity
                                onPress={() => toggleReviewExpansion(review.id)}
                                className="flex-row items-center justify-center py-2 mt-3"
                              >
                                <Text className="text-sm text-[#295298] font-medium">
                                  Hide comments
                                </Text>
                                <ChevronUp
                                  size={12}
                                  color="#295298"
                                  className="ml-1"
                                />
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      )}

                      {/* View Comments Button (when not expanded) */}
                      {!isExpanded && commentCount > 0 && (
                        <TouchableOpacity
                          onPress={() => toggleReviewExpansion(review.id)}
                          className="flex-row items-center justify-center py-2 mt-2"
                        >
                          <Text className="text-sm text-[#295298] font-medium">
                            View {commentCount} comment
                            {commentCount !== 1 ? "s" : ""}
                          </Text>
                          <ChevronDown
                            size={12}
                            color="#295298"
                            className="ml-1"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              ) : (
                <View className="bg-[#C2D0FF] rounded-xl p-8 items-center">
                  <Text className="text-base text-gray-600 mb-0">
                    No reviews yet
                  </Text>
                </View>
              )}
            </View>
          )}

          {isBadge && (
            <View className="bg-[#C2D0FF] rounded-xl p-8 items-center mb-6">
              {Object.entries(labels)
                .filter(([r]) => Number(r) <= currentRank)
                .map(([rank, label]) => (
                  <Text className="mb-3" key={rank}>
                    {label}
                  </Text>
                ))}
            </View>
          )}

          {isFavorite && (
            <View className="pb-6">
              <View className="bg-[#C2D0FF] rounded-xl p-8 items-center mb-3">
                <Text className="text-base text-gray-600 mb-0">
                  No favorites yet
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
