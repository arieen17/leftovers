import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { TopBar } from "@/components/TopBar";
import { FormField } from "@/components/FormField";
import { PhotoPicker } from "@/components/PhotoPicker";
import { AppText } from "@/components/AppText";
import { useAuth } from "@/context/AuthContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-base text-gray-600">Loading user data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6">
          <View className="bg-gray-50 rounded-2xl p-6">
            <AppText
              size="heading"
              bold
              className="mb-6 text-center text-black"
            >
              Profile Information
            </AppText>

            <PhotoPicker photo={undefined} onPhotoChange={() => {}} />

            <FormField
              label="NAME"
              value={user.name || ""}
              placeholder="Enter your name"
              onChangeText={() => {}}
              editable={false}
            />

            <View className="mb-6">
              <Text className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]">
                EMAIL
              </Text>
              <View className="flex-row items-center bg-gray-200 rounded-lg px-4 py-3 border border-[#E5E5D5]">
                <Text className="flex-1 text-base text-gray-600">
                  {user.email}
                </Text>
                <Text className="text-xs text-gray-500 ml-2">
                  (UCR Verified)
                </Text>
              </View>
            </View>

            {user.birthday && (
              <View className="mb-6">
                <Text className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]">
                  BIRTHDAY
                </Text>
                <View className="bg-gray-200 rounded-lg px-4 py-3 border border-[#E5E5D5]">
                  <Text className="text-base text-gray-600">
                    {user.birthday}
                  </Text>
                </View>
              </View>
            )}

            {user.phone_number && (
              <View className="mb-6">
                <Text className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]">
                  PHONE NUMBER
                </Text>
                <View className="bg-gray-200 rounded-lg px-4 py-3 border border-[#E5E5D5]">
                  <Text className="text-base text-gray-600">
                    {user.phone_number}
                  </Text>
                </View>
              </View>
            )}

            {user.address && (
              <View className="mb-6">
                <Text className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]">
                  ADDRESS
                </Text>
                <View className="bg-gray-200 rounded-lg px-4 py-3 border border-[#E5E5D5]">
                  <Text className="text-base text-gray-600">
                    {user.address}
                  </Text>
                </View>
              </View>
            )}

            <View className="mt-4">
              <TouchableOpacity
                className="w-full bg-[#295298] rounded-lg justify-center items-center py-4"
                onPress={handleGoBack}
              >
                <Text className="text-base text-white font-bold">Go Back</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              <Text className="text-xs text-gray-500 text-center">
                Profile editing will be available in a future update
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
