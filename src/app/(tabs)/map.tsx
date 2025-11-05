import { View, Image, ScrollView } from "react-native";
import { MapPin } from "lucide-react-native";
import { AppText } from "@/components/AppText";
import { TopBar } from "@/components/TopBar";

export default function MapScreen() {
  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <ScrollView className="flex-1">
        <Image
          source={require("../../../public/images/map.png")}
          className="w-full h-[300px]"
          resizeMode="contain"
        />

        <View className="px-4 py-4">
          <View className="flex-row items-center mb-4 gap-2">
            <View className="justify-center">
              <MapPin size={24} />
            </View>
            <AppText bold className="mb-0">
              Campus Locations
            </AppText>
          </View>

          <View className="gap-3">
            <View className="bg-[#96AFD9] rounded-lg p-4 border border-[#E5E5D5]">
              <AppText size="medium" bold>
                Location 1
              </AppText>
              <AppText size="small" className="text-gray-600 mt-1">
                Placeholder campus location
              </AppText>
            </View>

            <View className="bg-[#96AFD9] rounded-lg p-4 border border-[#E5E5D5]">
              <AppText size="medium" bold>
                Location 2
              </AppText>
              <AppText size="small" className="text-gray-600 mt-1">
                Placeholder campus location
              </AppText>
            </View>

            <View className="bg-[#96AFD9] rounded-lg p-4 border border-[#E5E5D5]">
              <AppText size="medium" bold>
                Location 3
              </AppText>
              <AppText size="small" className="text-gray-600 mt-1">
                Placeholder campus location
              </AppText>
            </View>

            <View className="bg-[#96AFD9] rounded-lg p-4 border border-[#E5E5D5]">
              <AppText size="medium" bold>
                Location 4
              </AppText>
              <AppText size="small" className="text-gray-600 mt-1">
                Placeholder campus location
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
