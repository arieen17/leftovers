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
import { Heart, MessageCircle } from "lucide-react-native";
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
        } else {
          console.error("Review not found:", reviewIdNum);
        }
      } else if (menuItemId) {
        const reviews = await apiRequest<Review[]>(
          `/api/reviews/menu-item/${menuItemId}`,
        );
        if (reviews.length > 0) {
          setReview(reviews[0]);
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
      const response = await apiRequest<Comment[]>(
        `/api/reviews/${review.id}/comments`,
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
    if (review) {
      loadComments();
      setIsLiked(review.user_liked || false);
      setLikeCount(review.like_count || 0);
    }
  }, [review, loadComments]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !review) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<any>(
        `/api/reviews/${review.id}/comments`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ comment: newComment.trim() }),
        },
      );

      setNewComment("");
      setComments([...comments, response]);
      if (review) {
        setReview({
          ...review,
          comment_count:
            response.comment_count || (review.comment_count || 0) + 1,
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeReview = async () => {
    if (!isAuthenticated || !review) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiRequest<{
        like_count: number;
        user_liked: boolean;
      }>(`/api/reviews/${review.id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsLiked(response.user_liked);
      setLikeCount(response.like_count);
      if (review) {
        setReview({
          ...review,
          like_count: response.like_count,
          user_liked: response.user_liked,
        });
      }
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
            disabled={!isAuthenticated}
          >
            <Heart
              size={20}
              fill={isLiked ? "#EF4444" : "transparent"}
              color={isLiked ? "#EF4444" : "#6B7280"}
            />
            <Text className="text-sm text-gray-700 ml-1">{likeCount}</Text>
          </TouchableOpacity>
          <View className="flex-row items-center">
            <MessageCircle size={20} color="#6B7280" />
            <Text className="text-sm text-gray-700 ml-1">
              {review.comment_count || comments.length || 0}
            </Text>
          </View>
        </View>

        <View className="px-4 pb-3">
          <Text className="text-sm text-gray-900 leading-5">
            {review.comment}
          </Text>
        </View>

        <View className="bg-white px-4 py-4">
          <View className="flex-row items-center mb-4">
            <MessageCircle size={18} color="#6B7280" />
            <Text className="text-base font-semibold text-gray-900 ml-2">
              Comments ({review.comment_count || comments.length || 0})
            </Text>
          </View>

          {isAuthenticated && (
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-yellow-200 mr-3 justify-center items-center">
                <Text className="text-xs text-gray-700">
                  {user?.name ? getUserInitials(user.name) : "U"}
                </Text>
              </View>
              <TextInput
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={handlePostComment}
                className="ml-2 bg-[#295298] rounded-lg px-4 py-2"
              >
                <Text className="text-white text-sm font-semibold">Post</Text>
              </TouchableOpacity>
            </View>
          )}

          {loadingComments ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#295298" />
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} className="flex-row mb-4">
                <View className="w-10 h-10 rounded-full bg-yellow-200 mr-3 justify-center items-center">
                  <Text className="text-xs text-gray-700">
                    {comment.user_name
                      ? getUserInitials(comment.user_name)
                      : "A"}
                  </Text>
                </View>
                <View className="flex-1 bg-[#E0F2FE] rounded-lg px-3 py-2">
                  <Text className="text-sm font-bold text-gray-900 mb-1">
                    {comment.user_name || "User"}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    {comment.comment}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
