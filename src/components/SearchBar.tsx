import { View, TextInput, TouchableOpacity } from "react-native";
import { Search, X } from "lucide-react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
};

export function SearchBar({ value, onChangeText, onSearch }: SearchBarProps) {
  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View className="mx-4 my-3">
      <View className="flex-row items-center bg-white rounded-full px-4 py-3 shadow-sm border border-gray-200">
        <Search size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search restaurants or dishes..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-base text-gray-900"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="ml-2">
            <X size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
