import { View, Image, Text, Pressable, Alert } from "react-native";
import { Star, Heart, MessageCircle, Trash2 } from "lucide-react-native";
import { Post, usePosts } from "@/context/PostsContext";

type HorizontalReviewCardProps = {
  post: Post;
};

export function HorizontalReviewCard({ post }: HorizontalReviewCardProps) {
  const { deletePost } = usePosts();

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours === 1) return "1h ago";
    return `${diffHours}h ago`;
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePost(post.id),
        },
      ],
    );
  };

  return (
    <View className="w-[300] h-[360] bg-[#C5DCE9] ml-2.5 rounded-xl overflow-hidden">
      <View className="flex-row justify-end p-3 pb-0">
        <Pressable
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={16} color="#EF4444" />
        </Pressable>
      </View>

      <View className="flex-row px-3 pb-2 items-start">
        <View className="w-10 h-10 rounded-full bg-gray-300 mr-2 overflow-hidden">
          <View className="w-full h-full bg-gray-200 justify-center items-center">
            <Text className="text-base text-gray-500">JD</Text>
          </View>
        </View>

        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800 mb-0.5">
            John Doe
          </Text>
          <Text className="text-[11px] text-gray-400">
            {getTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      <View className="px-3 py-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-gray-800 mb-0.5">
            {post.menuItem}
          </Text>
          <Text className="text-xs text-gray-500">{post.restaurant}</Text>
        </View>
        <View className="flex-row ml-2">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
            <Star
              key={star}
              size={14}
              fill={star <= post.rating ? "#FFD700" : "#D1D5DB"}
              color={star <= post.rating ? "#FFD700" : "#D1D5DB"}
              strokeWidth={2}
            />
          ))}
        </View>
      </View>

      {post.photo ? (
        <View className="px-3">
          <Image
            source={{ uri: post.photo }}
            className="w-full h-[180] rounded-lg"
            resizeMode="cover"
          />
        </View>
      ) : (
        <View className="px-3">
          <View className="w-full h-[180] bg-[#F5F5DC] rounded-lg justify-center items-center">
            <Text className="text-gray-400 text-xs">No Photo</Text>
          </View>
        </View>
      )}

      <View className="p-3 pt-2">
        <Text className="text-xs text-gray-800 mb-1.5" numberOfLines={1}>
          {post.review}
        </Text>

        <View className="flex-row items-center">
          <Heart size={16} fill="#EF4444" color="#EF4444" />
          <Text className="text-xs text-gray-800 ml-1 mr-3">15</Text>
          <MessageCircle size={16} color="#6B7280" />
          <Text className="text-xs text-gray-800 ml-1">20</Text>
        </View>
      </View>
    </View>
  );
}
