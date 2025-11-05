import { View, Pressable } from "react-native";
import { Star } from "lucide-react-native";

type StarRatingProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
};

export function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
}: StarRatingProps) {
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <Pressable
          key={star}
          onPress={() => onRatingChange(star)}
          className="p-1"
        >
          <Star
            size={32}
            fill={star <= rating ? "#FFD700" : "transparent"}
            color={star <= rating ? "#FFD700" : "#D1D5DB"}
            strokeWidth={2}
          />
        </Pressable>
      ))}
    </View>
  );
}
