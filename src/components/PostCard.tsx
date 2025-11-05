import { View, Image, Pressable, Alert } from "react-native";
import { AppText } from "./AppText";
import { Star, Trash2 } from "lucide-react-native";
import { Post, usePosts } from "@/context/PostsContext";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const { deletePost } = usePosts();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <AppText size="large" bold className="text-black mb-1">
            {post.restaurant}
          </AppText>
          <AppText size="medium" className="text-gray-600">
            {post.menuItem}
          </AppText>
        </View>
        <View className="flex-row items-center gap-2">
          <AppText size="small" className="text-gray-400">
            {formatDate(post.createdAt)}
          </AppText>
          <Pressable
            onPress={handleDelete}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= post.rating ? "#FFD700" : "transparent"}
            color={star <= post.rating ? "#FFD700" : "#D1D5DB"}
            strokeWidth={2}
          />
        ))}
      </View>

      {post.photo && (
        <Image
          source={{ uri: post.photo }}
          className="w-full h-48 rounded-lg mb-3"
          resizeMode="cover"
        />
      )}

      <AppText size="medium" className="text-gray-800">
        {post.review}
      </AppText>
    </View>
  );
}
