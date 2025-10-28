import { View } from "react-native";
import { AppText } from "@/components/AppText";

export default function ProfileScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <AppText size="large" bold>
        Profile Screen
      </AppText>
    </View>
  );
}
