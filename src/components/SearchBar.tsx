import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";

export function SearchBar() {
  return (
    <View className="mx-4 my-3">
      <View className="flex-row items-center bg-white rounded-full px-4 py-3 shadow-sm border border-gray-200">
        <Search size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search restaurants or dishes..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-base text-gray-900"
          editable={false}
        />
      </View>
    </View>
  );
}
