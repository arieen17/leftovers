import { View } from "react-native";
import { TopBar } from "@/components/TopBar";
import { CreateReviewForm } from "@/components/CreateReviewForm";

export default function PostScreen() {
  return (
    <View className="flex-1 bg-light-blue">
      <TopBar />
      <CreateReviewForm />
    </View>
  );
}
