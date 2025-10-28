import { View } from "react-native";
import { AppText } from "@/components/AppText";

export default function HomeScreen() {
  return (
    <View className="justify-center items-center bg-white">
      <AppText size="large" bold>
        Home Screen
      </AppText>
    </View>
  );
}
