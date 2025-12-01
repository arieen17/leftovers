import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import {
  RotateCw,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react-native";
import { AppText } from "@/components/AppText";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import {
  getUserRecommendations,
  getPopularItems,
} from "@/services/recommendationService";
import { type MenuItem } from "@/services/restaurantService";
import { apiRequest } from "@/services/api";
import { getAuthToken } from "@/services/authService";

interface PopularMenuItem extends MenuItem {
  restaurant_name?: string;
  average_rating?: string;
  review_count?: string;
}

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

export default function DiscoverScreen() {
  const [forYouItems, setForYouItems] = useState<MenuItem[]>([]);
  const [popularItems, setPopularItems] = useState<PopularMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [reviews, setReviews] = useState<{ [key: number]: Review[] }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [loadingReviews, setLoadingReviews] = useState<{
    [key: number]: boolean;
  }>({});
  const [loadingComments, setLoadingComments] = useState<{
    [key: number]: boolean;
  }>({});

  const { user, isAuthenticated } = useAuth();

  const loadRecommendations = async () => {
    try {
      setLoading(true);

      const popular = await getPopularItems(5);
      setPopularItems(popular);

      if (isAuthenticated && user) {
        try {
          const personalized = await getUserRecommendations(5);
          setForYouItems(personalized);
        } catch (error) {
          console.log("No personalized recommendations available");
        }
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setExpandedItem(null);
    setExpandedReview(null);
    setReviews({});
    setComments({});
    loadRecommendations();
  };

  const toggleItemExpansion = async (itemId: number) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
      setExpandedReview(null);
    } else {
      setExpandedItem(itemId);
      setExpandedReview(null);
      await loadReviewsForItem(itemId);
    }
  };

  const toggleReviewExpansion = async (reviewId: number) => {
    if (expandedReview === reviewId) {
      setExpandedReview(null);
    } else {
      setExpandedReview(reviewId);
      await loadCommentsForReview(reviewId);
    }
  };

  const loadReviewsForItem = async (menuItemId: number) => {
    try {
      setLoadingReviews((prev) => ({ ...prev, [menuItemId]: true }));
      const response = await apiRequest<Review[]>(
        `/api/reviews/menu-item/${menuItemId}`,
      );
      setReviews((prev) => ({ ...prev, [menuItemId]: response }));
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoadingReviews((prev) => ({ ...prev, [menuItemId]: false }));
    }
  };

  const loadCommentsForReview = async (reviewId: number) => {
    try {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: true }));
      const response = await apiRequest<Comment[]>(
        `/api/reviews/${reviewId}/comments`,
      );
      setComments((prev) => ({ ...prev, [reviewId]: response }));
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleLikeReview = async (reviewId: number, menuItemId: number) => {
    if (!isAuthenticated) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<{
        message: string;
        like_count: number;
        user_liked: boolean;
      }>(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the specific review in state
      setReviews((prev) => ({
        ...prev,
        [menuItemId]:
          prev[menuItemId]?.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  like_count: response.like_count,
                  user_liked: response.user_liked,
                }
              : review,
          ) || [],
      }));
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const handleLikeComment = async (commentId: number, reviewId: number) => {
    if (!isAuthenticated) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<{
        message: string;
        like_count: number;
        user_liked: boolean;
      }>(`/api/reviews/comments/${commentId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the specific comment in state
      setComments((prev) => ({
        ...prev,
        [reviewId]:
          prev[reviewId]?.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  like_count: response.like_count,
                  user_liked: response.user_liked,
                }
              : comment,
          ) || [],
      }));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleAddComment = async (reviewId: number, menuItemId: number) => {
    if (!isAuthenticated || !newComments[reviewId]?.trim()) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<any>(
        `/api/reviews/${reviewId}/comments`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ comment: newComments[reviewId] }),
        },
      );

      setNewComments((prev) => ({ ...prev, [reviewId]: "" }));

      // Add the new comment to state and update review comment count
      setComments((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), response],
      }));

      // Update review comment count
      setReviews((prev) => ({
        ...prev,
        [menuItemId]:
          prev[menuItemId]?.map((review) =>
            review.id === reviewId
              ? { ...review, comment_count: response.comment_count }
              : review,
          ) || [],
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [isAuthenticated, user]);

  const RecommendationItem = ({
    item,
  }: {
    item: MenuItem | PopularMenuItem;
  }) => (
    <View className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden">
      <TouchableOpacity
        className="p-3 flex-row"
        onPress={() => toggleItemExpansion(item.id)}
      >
        <View className="w-24 h-24 bg-[#F5F5DC] rounded-lg mr-3 items-center justify-center">
          <AppText size="small" className="text-center">
            {item.image_url ? "Image" : "No Image"}
          </AppText>
        </View>
        <View className="flex-1">
          <AppText bold className="text-gray-900 mb-1">
            {item.name}
          </AppText>
          <AppText size="small" className="text-gray-600 mb-1">
            {"restaurant_name" in item ? item.restaurant_name : ""}
          </AppText>
          <AppText size="small" className="text-gray-600 mb-2">
            {item.description || "No description available"}
          </AppText>
          <View className="flex-row justify-between items-center">
            <AppText bold className="text-[#295298]">
              ${item.price}
            </AppText>
            {"average_rating" in item && item.average_rating && (
              <AppText size="small" className="text-gray-600">
                ⭐ {parseFloat(item.average_rating).toFixed(1)}
                {"review_count" in item && item.review_count && (
                  <AppText size="small" className="text-gray-500">
                    {" "}
                    ({item.review_count} reviews)
                  </AppText>
                )}
              </AppText>
            )}
          </View>
          {item.tags && item.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="bg-[#E5E7EB] rounded-full px-2 py-1 mr-1 mb-1"
                >
                  <AppText size="small" className="text-gray-700">
                    {tag}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </View>
        <View className="justify-center">
          {expandedItem === item.id ? (
            <ChevronUp size={20} color="#6B7280" />
          ) : (
            <ChevronDown size={20} color="#6B7280" />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Reviews Section */}
      {expandedItem === item.id && (
        <View className="border-t border-gray-200 p-3">
          {loadingReviews[item.id] ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#295298" />
              <AppText size="small" className="text-gray-600 mt-2">
                Loading reviews...
              </AppText>
            </View>
          ) : reviews[item.id]?.length > 0 ? (
            <View className="space-y-3">
              <AppText bold className="text-gray-900 mb-2">
                Reviews
              </AppText>
              {reviews[item.id].map((review) => (
                <View
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <TouchableOpacity
                    onPress={() => toggleReviewExpansion(review.id)}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <AppText bold className="text-gray-900">
                          {review.user_name || "User"}
                        </AppText>
                        <View className="flex-row items-center mt-1">
                          {Array.from({ length: 5 }, (_, i) => i + 1).map(
                            (star) => (
                              <Text
                                key={star}
                                className="text-yellow-400 text-sm"
                              >
                                {star <= review.rating ? "★" : "☆"}
                              </Text>
                            ),
                          )}
                        </View>
                      </View>
                      {expandedReview === review.id ? (
                        <ChevronUp size={16} color="#6B7280" />
                      ) : (
                        <ChevronDown size={16} color="#6B7280" />
                      )}
                    </View>

                    <AppText size="small" className="text-gray-700">
                      {review.comment}
                    </AppText>

                    <View className="flex-row justify-between items-center mt-2">
                      <View className="flex-row items-center space-x-3">
                        <TouchableOpacity
                          className="flex-row items-center"
                          onPress={() => handleLikeReview(review.id)}
                        >
                          <Heart
                            size={16}
                            fill={review.user_liked ? "#EF4444" : "transparent"}
                            color={review.user_liked ? "#EF4444" : "#6B7280"}
                          />
                          <AppText size="small" className="text-gray-600 ml-1">
                            {review.like_count || 0}
                          </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-row items-center"
                          onPress={() => toggleReviewExpansion(review.id)}
                        >
                          <MessageCircle size={16} color="#6B7280" />
                          <AppText size="small" className="text-gray-600 ml-1">
                            {review.comment_count || 0}
                          </AppText>
                        </TouchableOpacity>
                      </View>
                      <AppText size="small" className="text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </AppText>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Comments Section */}
                  {expandedReview === review.id && (
                    <View className="mt-3 border-t border-gray-200 pt-3">
                      {loadingComments[review.id] ? (
                        <ActivityIndicator size="small" color="#295298" />
                      ) : (
                        <>
                          {/* Comments List */}
                          {comments[review.id]?.map((comment) => (
                            <View
                              key={comment.id}
                              className="mb-3 pb-2 border-b border-gray-100"
                            >
                              <AppText
                                bold
                                size="small"
                                className="text-gray-900"
                              >
                                {comment.user_name || "User"}
                              </AppText>
                              <AppText
                                size="small"
                                className="text-gray-700 mt-1"
                              >
                                {comment.comment}
                              </AppText>
                              <View className="flex-row justify-between items-center mt-1">
                                <TouchableOpacity
                                  className="flex-row items-center"
                                  onPress={() => handleLikeComment(comment.id)}
                                >
                                  <Heart
                                    size={14}
                                    fill={
                                      comment.user_liked
                                        ? "#EF4444"
                                        : "transparent"
                                    }
                                    color={
                                      comment.user_liked ? "#EF4444" : "#6B7280"
                                    }
                                  />
                                  <AppText
                                    size="small"
                                    className="text-gray-500 ml-1"
                                  >
                                    {comment.like_count || 0}
                                  </AppText>
                                </TouchableOpacity>
                                <AppText size="small" className="text-gray-500">
                                  {new Date(
                                    comment.created_at,
                                  ).toLocaleDateString()}
                                </AppText>
                              </View>
                            </View>
                          ))}

                          {/* Add Comment Input */}
                          {isAuthenticated && (
                            <View className="flex-row items-center mt-2">
                              <TextInput
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm"
                                placeholder="Add a comment..."
                                value={newComments[review.id] || ""}
                                onChangeText={(text) =>
                                  setNewComments((prev) => ({
                                    ...prev,
                                    [review.id]: text,
                                  }))
                                }
                                onSubmitEditing={() =>
                                  handleAddComment(review.id)
                                }
                              />
                              <TouchableOpacity
                                className="ml-2 bg-[#295298] rounded-full p-2"
                                onPress={() => handleAddComment(review.id)}
                              >
                                <Send size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <AppText className="text-gray-500 text-center">
              No reviews yet
            </AppText>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <ScrollView className="flex-1">
        <View className="bg-[#AAD7EB] px-4 pt-3 items-center">
          <AppText size="large" bold className="text-[#295298]">
            Discover
          </AppText>
        </View>

        <View className="px-4 py-3 items-center gap-3">
          <Pressable
            className="flex-row items-center gap-2"
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RotateCw size={16} color="#6B7280" />
            <AppText size="small" className="text-gray-600 mb-0">
              {refreshing ? "Refreshing..." : "Refresh Recommendations"}
            </AppText>
          </Pressable>
        </View>

        <View className="p-4">
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#295298" />
              <AppText className="text-gray-600 mt-2">
                Loading recommendations...
              </AppText>
            </View>
          ) : (
            <>
              {/* For You Section */}
              <View className="mb-6">
                <AppText size="large" bold className="text-gray-900 mb-3">
                  For You
                </AppText>

                {isAuthenticated ? (
                  forYouItems.length > 0 ? (
                    forYouItems.map((item) => (
                      <RecommendationItem key={item.id} item={item} />
                    ))
                  ) : (
                    <View className="bg-white rounded-lg border border-gray-200 p-4 items-center">
                      <AppText className="text-gray-600 text-center mb-2">
                        Rate more dishes to get personalized recommendations
                      </AppText>
                      <AppText
                        size="small"
                        className="text-gray-500 text-center"
                      >
                        The more you rate, the better we can suggest dishes
                        you'll love
                      </AppText>
                    </View>
                  )
                ) : (
                  <View className="bg-white rounded-lg border border-gray-200 p-4 items-center">
                    <AppText className="text-gray-600 text-center">
                      Sign in to get personalized recommendations
                    </AppText>
                  </View>
                )}
              </View>

              {/* Popular Near You Section */}
              <View>
                <AppText size="large" bold className="text-gray-900 mb-3">
                  Popular Near You
                </AppText>

                {popularItems.length > 0 ? (
                  popularItems.map((item) => (
                    <RecommendationItem key={item.id} item={item} />
                  ))
                ) : (
                  <View className="bg-white rounded-lg border border-gray-200 p-4 items-center">
                    <AppText className="text-gray-600">
                      No popular items available
                    </AppText>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
