import { View } from "react-native";
import { AppText } from "@/components/AppText";

export default function PostScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <AppText size="large" bold>
        Post Screen
      </AppText>
    </View>
  );
}
