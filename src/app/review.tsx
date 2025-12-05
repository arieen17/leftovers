import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { Heart, MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react-native";
import { apiRequest } from "@/services/api";
import { getAuthToken } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { getReviewById } from "@/services/reviewService";

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

export default function ReviewScreen() {
  const { menuItemId, reviewId } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likingReview, setLikingReview] = useState(false);
  const [likingComment, setLikingComment] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState(false);

  const loadReview = useCallback(async () => {
    try {
      setLoading(true);
      if (reviewId) {
        const reviewIdNum = Array.isArray(reviewId)
          ? Number(reviewId[0])
          : Number(reviewId);
        console.log("Loading review with ID:", reviewIdNum);
        
        const foundReview = await getReviewById(reviewIdNum);
        if (foundReview) {
          setReview(foundReview);
          setIsLiked(foundReview.user_liked || false);
          setLikeCount(foundReview.like_count || 0);
        } else {
          console.error("Review not found:", reviewIdNum);
        }
      } else if (menuItemId) {
        const token = getAuthToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const reviews = await apiRequest<Review[]>(
          `/api/reviews/menu-item/${menuItemId}`,
          {
            method: 'GET',
            headers,
          }
        );
        if (reviews.length > 0) {
          setReview(reviews[0]);
          setIsLiked(reviews[0].user_liked || false);
          setLikeCount(reviews[0].like_count || 0);
        }
      }
    } catch (error) {
      console.error("Error loading review:", error);
    } finally {
      setLoading(false);
    }
  }, [menuItemId, reviewId]);

  const loadComments = useCallback(async () => {
    if (!review) return;
    try {
      setLoadingComments(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await apiRequest<Comment[]>(
        `/api/reviews/${review.id}/comments`,
        {
          method: 'GET',
          headers,
        }
      );
      setComments(response || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [review]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  useEffect(() => {
    if (review && expandedComments) {
      loadComments();
    }
  }, [review, expandedComments, loadComments]);

  const toggleComments = () => {
    setExpandedComments(!expandedComments);
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !review) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<any>(
        `/api/reviews/${review.id}/comments`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: newComment.trim() }),
        },
      );

      setNewComment("");
      setComments([...comments, response]);
      if (review) {
        setReview({
          ...review,
          comment_count: response.comment_count || (review.comment_count || 0) + 1,
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeReview = async () => {
    if (!isAuthenticated || !review || likingReview) return;

    try {
      setLikingReview(true);
      const token = getAuthToken();
      if (!token) return;

      const action = isLiked ? 'unlike' : 'like';
      
      const response = await apiRequest<any>(
        `/api/reviews/${review.id}/like?action=${action}`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setIsLiked(response.user_liked || false);
      setLikeCount(response.like_count || 0);
      if (review) {
        setReview({
          ...review,
          like_count: response.like_count || 0,
          user_liked: response.user_liked || false,
        });
      }
    } catch (error) {
      console.error("Error liking/unliking review:", error);
    } finally {
      setLikingReview(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!isAuthenticated || likingComment === commentId) return;

    try {
      setLikingComment(commentId);
      const token = getAuthToken();
      if (!token) return;

      const currentComment = comments.find(c => c.id === commentId);
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

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                like_count: response.like_count || 0,
                user_liked: response.user_liked || false,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking/unliking comment:", error);
    } finally {
      setLikingComment(null);
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
    router.back();
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

  if (!review) {
    return (
      <View className="flex-1 bg-[#FFFBE6]">
        <TopBar />
        <View className="bg-[#C5DCE9] flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={backMenu} className="mr-4">
            <Text className="text-lg text-black">{"<"}</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">Review</Text>
        </View>
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-600 text-center">No review found</Text>
        </View>
      </View>
    );
  }

  const commentCount = review.comment_count || comments.length || 0;

  return (
    <View className="flex-1 bg-[#FFFBE6]">
      <TopBar />
      <View className="bg-[#C5DCE9] flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={backMenu} className="mr-4">
          <Text className="text-lg text-black">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-black">Review</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-[#FFFBE6] px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden justify-center items-center">
              <Text className="text-base text-gray-600">
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
          </View>
        </View>

        {review.photos && review.photos.length > 0 && review.photos[0] ? (
          <View className="px-0">
            <Image
              source={{ uri: review.photos[0] }}
              className="w-full h-[300]"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View className="px-0">
            <View className="w-full h-[300] bg-gray-200 justify-center items-center">
              <Text className="text-gray-400 text-sm">No Photo</Text>
            </View>
          </View>
        )}

        <View className="flex-row items-center px-4 py-3 gap-4">
          <TouchableOpacity
            onPress={handleLikeReview}
            className="flex-row items-center"
            disabled={!isAuthenticated || likingReview}
          >
            {likingReview ? (
              <ActivityIndicator size={14} color="#EF4444" />
            ) : (
              <Heart
                size={20}
                fill={isLiked ? "#EF4444" : "transparent"}
                color={isLiked ? "#EF4444" : "#6B7280"}
              />
            )}
            <Text className="text-sm text-gray-700 ml-1">{likeCount}</Text>
          </TouchableOpacity>
          
          {/* Expandable comments toggle */}
          <TouchableOpacity
            onPress={toggleComments}
            className="flex-row items-center"
          >
            <MessageCircle size={20} color="#6B7280" />
            <Text className="text-sm text-gray-700 ml-1">{commentCount}</Text>
            <View className="ml-2">
              {expandedComments ? (
                <ChevronUp size={16} color="#6B7280" />
              ) : (
                <ChevronDown size={16} color="#6B7280" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View className="px-4 pb-3">
          <Text className="text-sm text-gray-900 leading-5">
            {review.comment}
          </Text>
        </View>

        {/* Comments Section */}
        <View className="bg-white px-4 py-4">
          <View className="flex-row items-center mb-4">
            <MessageCircle size={18} color="#6B7280" />
            <Text className="text-base font-semibold text-gray-900 ml-2">
              Comments ({commentCount})
            </Text>
          </View>

          {/* Add Comment Input */}
          {isAuthenticated && (
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-yellow-200 mr-3 justify-center items-center">
                <Text className="text-xs text-gray-700">
                  {getUserInitials(user?.name || "User")}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center border border-gray-300 rounded-full px-3 py-2">
                <TextInput
                  className="flex-1 text-sm"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={handlePostComment}
                  disabled={!newComment.trim()}
                  className={`ml-2 rounded-full p-2 ${newComment.trim() ? "bg-[#295298]" : "bg-gray-300"}`}
                >
                  <Send size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Comments List (Expanded) */}
          {expandedComments && (
            <View className="mt-2">
              {loadingComments ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#295298" />
                  <Text className="text-gray-500 text-sm mt-2">Loading comments...</Text>
                </View>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.id} className="mb-4 pb-3 border-b border-gray-100 last:border-0">
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
                            onPress={() => handleLikeComment(comment.id)}
                            disabled={!isAuthenticated || likingComment === comment.id}
                            className="flex-row items-center mr-4"
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
                ))
              ) : (
                <View className="py-4 items-center">
                  <Text className="text-gray-500 text-sm">No comments yet</Text>
                  <Text className="text-gray-400 text-xs mt-1">Be the first to comment!</Text>
                </View>
              )}
            </View>
          )}

          {/* Show "View Comments" button when not expanded and there are comments */}
          {!expandedComments && commentCount > 0 && (
            <TouchableOpacity
              onPress={toggleComments}
              className="flex-row items-center justify-center py-3"
            >
              <Text className="text-sm text-[#295298] font-medium">
                View {commentCount} comment{commentCount !== 1 ? 's' : ''}
              </Text>
              <ChevronDown size={14} color="#295298" className="ml-1" />
            </TouchableOpacity>
          )}

          {/* Show "Hide Comments" button when expanded */}
          {expandedComments && comments.length > 0 && (
            <TouchableOpacity
              onPress={toggleComments}
              className="flex-row items-center justify-center py-3"
            >
              <Text className="text-sm text-[#295298] font-medium">
                Hide comments
              </Text>
              <ChevronUp size={14} color="#295298" className="ml-1" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}