import { View, ScrollView, Pressable } from "react-native";
import { RotateCw } from "lucide-react-native";
import { AppText } from "@/components/AppText";
import { TopBar } from "@/components/TopBar";

export default function DiscoverScreen() {
  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <ScrollView className="flex-1">
        <View className="bg-[#AAD7EB] px-4 pt-3 items-center">
          <AppText size="large" bold className="text-[#295298]">
            Discover
          </AppText>
        </View>

        <View className="px-4 py-3 items-center gap-3">
          <Pressable className="border border-gray-400 rounded-lg px-5 py-2">
            <AppText bold className="text-gray-700 mb-0">
              FOR YOU
            </AppText>
          </Pressable>

          <Pressable className="flex-row items-center gap-2">
            <RotateCw size={16} color="#6B7280" />
            <AppText size="small" className="text-gray-600 mb-0">
              Regenerate Options
            </AppText>
          </Pressable>
        </View>

        <View className="p-4 gap-4">
          <View className="bg-white rounded-lg border border-gray-200 p-3 flex-row">
            <View className="w-24 h-24 bg-[#F5F5DC] rounded-lg mr-3" />
            <View className="flex-1 h-24 bg-gray-100 rounded-lg" />
          </View>
          <View className="bg-white rounded-lg border border-gray-200 p-3 flex-row">
            <View className="w-24 h-24 bg-[#F5F5DC] rounded-lg mr-3" />
            <View className="flex-1 h-24 bg-gray-100 rounded-lg" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
