import { useState, useMemo } from "react";
import {
  View,
  Pressable,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react-native";
import { cn } from "@/utils/cn";

type DropdownProps = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
  searchable?: boolean;
};

export function Dropdown({
  label,
  value,
  placeholder,
  options,
  onSelect,
  searchable = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    return options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery, searchable]);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <View className={label ? "mb-6" : ""}>
      {label ? (
        <Text className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]">
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between bg-[#F5F5DC] rounded-lg px-4 py-3 border border-[#E5E5D5]"
      >
        <Text
          className={cn(
            "flex-1 text-base",
            value ? "text-gray-900" : "text-gray-400",
          )}
        >
          {value || placeholder}
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color="#6B7280" />
        ) : (
          <ChevronDown size={20} color="#6B7280" />
        )}
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            className="flex-1"
            onPress={handleClose}
          />
          <View className="bg-white rounded-t-3xl h-2/3 absolute bottom-0 left-0 right-0">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-black mb-2">
                {label}
              </Text>
              {searchable && (
                <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                  <Search size={18} color="#6B7280" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search..."
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2 text-base text-gray-900"
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")}>
                      <X size={18} color="#6B7280" />
                    </Pressable>
                  )}
                </View>
              )}
            </View>
            <View className="flex-1">
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    className={cn(
                      "px-4 py-3 border-b border-gray-100",
                      value === item && "bg-blue-50",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        value === item
                          ? "text-blue-600 font-semibold"
                          : "text-gray-900",
                      )}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="p-4 items-center">
                    <Text className="text-gray-400 text-base">
                      No results found
                    </Text>
                  </View>
                }
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
