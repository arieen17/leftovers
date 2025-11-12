import { View, TextInput, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
};

export function FormField({
  label,
  value,
  placeholder,
  onChangeText,
  onPress,
}: FormFieldProps) {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]">
        {label}
      </Text>
      <View className="flex-row items-center bg-[#F5F5DC] rounded-lg px-4 py-3 border border-[#E5E5D5]">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-base text-gray-900"
          onFocus={onPress}
        />
        <ChevronRight size={20} color="#6B7280" />
      </View>
    </View>
  );
}
