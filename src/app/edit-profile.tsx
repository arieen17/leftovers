import { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { TopBar } from "@/components/TopBar";
import { FormField } from "@/components/FormField";
import { PhotoPicker } from "@/components/PhotoPicker";
import { AppText } from "@/components/AppText";

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("jdoe002@ucr.edu");
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();

  const handleSave = () => {
    // we need to implement the backend logic to update the profile
    Alert.alert("Success", "Profile updated successfully!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
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
                Edit Profile
              </AppText>

              <PhotoPicker
                photo={profilePhoto}
                onPhotoChange={setProfilePhoto}
              />

              <FormField
                label="NAME"
                value={name}
                placeholder="Enter your name"
                onChangeText={setName}
              />

              <FormField
                label="EMAIL"
                value={email}
                placeholder="Enter your email"
                onChangeText={setEmail}
              />

              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 rounded-lg justify-center items-center py-4 mr-3"
                  onPress={handleCancel}
                >
                  <Text className="text-base text-black font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-[#295298] rounded-lg justify-center items-center py-4"
                  onPress={handleSave}
                >
                  <Text className="text-base text-white font-bold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
