import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { Heart, MessageCircle, Star, ChevronDown, ChevronUp, Send } from "lucide-react-native";
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

export default function MenuItemReviewsScreen() {
  const { menuItemId } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Expanded reviews state
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: number]: boolean }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [likingReview, setLikingReview] = useState<number | null>(null);
  const [likingComment, setLikingComment] = useState<number | null>(null);

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

    // Load reviews using the service function (which now includes auth token)
    const reviewsData = await getMenuItemReviews(id);
    setReviews(reviewsData);
    
    // Log to check if user_liked is being set
    console.log("Loaded reviews with user_liked status:", 
      reviewsData.map(r => ({ id: r.id, user_liked: r.user_liked }))
    );
    
  } catch (error) {
    console.error("Error loading reviews:", error);
  } finally {
    setLoading(false);
  }
}, [menuItemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleReviewExpansion = async (reviewId: number) => {
    if (expandedReviews.includes(reviewId)) {
      setExpandedReviews(expandedReviews.filter(id => id !== reviewId));
    } else {
      setExpandedReviews([...expandedReviews, reviewId]);
      await loadCommentsForReview(reviewId);
    }
  };

  const loadCommentsForReview = async (reviewId: number) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: true }));
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await apiRequest<Comment[]>(
        `/api/reviews/${reviewId}/comments`,
        {
          method: 'GET',
          headers,
        }
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
      const currentReview = reviews.find(r => r.id === reviewId);
      const isCurrentlyLiked = currentReview?.user_liked || false;
      const action = isCurrentlyLiked ? 'unlike' : 'like';
      
      const response = await apiRequest<any>(
        `/api/reviews/${reviewId}/like?action=${action}`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Update the specific review in state
      setReviews((prev) =>
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
      const currentComment = comments[reviewId]?.find(c => c.id === commentId);
      const isCurrentlyLiked = currentComment?.user_liked || false;
      const action = isCurrentlyLiked ? 'unlike' : 'like';
      
      const response = await apiRequest<any>(
        `/api/reviews/comments/${commentId}/like?action=${action}`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Update the specific comment in state
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
            'Content-Type': 'application/json',
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
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { 
                ...review, 
                comment_count: response.comment_count || (review.comment_count || 0) + 1 
              }
            : review,
        )
      );
    } catch (error) {
      console.error("Error adding comment:", error);
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
    if (!name) return "U";
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
          reviews.map((review) => {
            const isExpanded = expandedReviews.includes(review.id);
            const reviewComments = comments[review.id] || [];
            const commentCount = review.comment_count || reviewComments.length || 0;

            return (
              <View
                key={review.id}
                className="bg-white mb-3 mx-4 rounded-lg p-4 shadow-sm border border-gray-200"
              >
                {/* Review Header */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 overflow-hidden justify-center items-center">
                    <Text className="text-sm text-gray-600">
                      {getUserInitials(review.user_name || "User")}
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

                {/* Review Photo */}
                {review.photos && review.photos.length > 0 && review.photos[0] && (
                  <Image
                    source={{ uri: review.photos[0] }}
                    className="w-full h-[200] rounded-lg mb-3"
                    resizeMode="cover"
                  />
                )}

                {/* Review Comment */}
                {review.comment && (
                  <Text className="text-sm text-gray-900 mb-3">
                    {review.comment}
                  </Text>
                )}

                {/* Like/Comment/Expand Row */}
                <View className="flex-row items-center justify-between pt-2 border-t border-gray-200">
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => handleLikeReview(review.id)}
                      disabled={!isAuthenticated || likingReview === review.id}
                      className="flex-row items-center mr-4"
                    >
                      {likingReview === review.id ? (
                        <ActivityIndicator size={14} color="#EF4444" />
                      ) : (
                        <Heart
                          size={16}
                          fill={review.user_liked ? "#EF4444" : "transparent"}
                          color={review.user_liked ? "#EF4444" : "#6B7280"}
                        />
                      )}
                      <Text className="text-sm text-gray-700 ml-1">
                        {review.like_count || 0}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => toggleReviewExpansion(review.id)}
                      className="flex-row items-center"
                    >
                      <MessageCircle size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-700 ml-1">
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
                </View>

                {/* Expanded Comments Section */}
                {isExpanded && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    {/* Comments List */}
                    {loadingComments[review.id] ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#295298" />
                        <Text className="text-gray-500 text-sm mt-2">Loading comments...</Text>
                      </View>
                    ) : reviewComments.length > 0 ? (
                      <View className="mb-3">
                        <Text className="text-sm font-semibold text-gray-900 mb-2">
                          Comments ({reviewComments.length})
                        </Text>
                        {reviewComments.map((comment) => (
                          <View key={comment.id} className="mb-3 pb-2 border-b border-gray-100 last:border-0">
                            <View className="flex-row">
                              <View className="w-8 h-8 rounded-full bg-yellow-200 mr-3 justify-center items-center">
                                <Text className="text-xs text-gray-700">
                                  {getUserInitials(comment.user_name || "User")}
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
                                    onPress={() => handleLikeComment(comment.id, review.id)}
                                    disabled={!isAuthenticated || likingComment === comment.id}
                                    className="flex-row items-center"
                                  >
                                    {likingComment === comment.id ? (
                                      <ActivityIndicator size={12} color="#EF4444" />
                                    ) : (
                                      <Heart
                                        size={14}
                                        fill={comment.user_liked ? "#EF4444" : "transparent"}
                                        color={comment.user_liked ? "#EF4444" : "#6B7280"}
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
                        <Text className="text-gray-500 text-sm">No comments yet</Text>
                        <Text className="text-gray-400 text-xs mt-1">Be the first to comment!</Text>
                      </View>
                    )}

                    {/* Add Comment Input */}
                    {isAuthenticated && (
                      <View className="flex-row items-center mt-2">
                        <View className="w-8 h-8 rounded-full bg-yellow-200 mr-3 justify-center items-center">
                          <Text className="text-xs text-gray-700">
                            {getUserInitials(user?.name || "User")}
                          </Text>
                        </View>
                        <View className="flex-1 flex-row items-center border border-gray-300 rounded-full px-3 py-2">
                          <TextInput
                            className="flex-1 text-sm"
                            placeholder="Add a comment..."
                            value={newComments[review.id] || ""}
                            onChangeText={(text) =>
                              setNewComments((prev) => ({ ...prev, [review.id]: text }))
                            }
                            placeholderTextColor="#9CA3AF"
                            multiline
                            maxLength={500}
                          />
                          <TouchableOpacity
                            onPress={() => handleAddComment(review.id)}
                            disabled={!newComments[review.id]?.trim()}
                            className={`ml-2 rounded-full p-2 ${newComments[review.id]?.trim() ? "bg-[#295298]" : "bg-gray-300"}`}
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
                      <ChevronUp size={12} color="#295298" className="ml-1" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* View Comments Button (when not expanded) */}
                {!isExpanded && commentCount > 0 && (
                  <TouchableOpacity
                    onPress={() => toggleReviewExpansion(review.id)}
                    className="flex-row items-center justify-center py-2 mt-2"
                  >
                    <Text className="text-sm text-[#295298] font-medium">
                      View {commentCount} comment{commentCount !== 1 ? 's' : ''}
                    </Text>
                    <ChevronDown size={12} color="#295298" className="ml-1" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}