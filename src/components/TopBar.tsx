import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BearIcon from "../../public/images/bear.svg";

export function TopBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const navigateToHome = () => {
    router.push("/(tabs)/");
  };

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-3 bg-[#295298]"
      style={{ paddingTop: insets.top }}
    >
      <Pressable onPress={navigateToHome}>
        <BearIcon width={48} height={48} />
      </Pressable>
      <Pressable onPress={navigateToHome}>
        <Text
          className="text-white uppercase text-4xl font-bayon tracking-[3]"
          style={{
            lineHeight: 60,
            includeFontPadding: false,
          }}
        >
          R{`'`}ATE
        </Text>
      </Pressable>
    </View>
  );
}
