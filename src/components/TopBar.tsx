import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BearIcon from "../../public/images/bear.svg";

export function TopBar() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-3 bg-[#295298]"
      style={{ paddingTop: insets.top }}
    >
      <BearIcon width={48} height={48} />
      <Text
        className="text-white uppercase text-4xl"
        style={{
          fontFamily: "Bayon_400Regular",
          lineHeight: 60,
          includeFontPadding: false,
          letterSpacing: 3,
        }}
      >
        R{`'`}ATE
      </Text>
    </View>
  );
}
