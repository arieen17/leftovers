import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { TopBar } from "@/components/TopBar";
import { FormField } from "@/components/FormField";
import { PhotoPicker } from "@/components/PhotoPicker";
import { AppText } from "@/components/AppText";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, setCurrentUser } from "@/services/authService";
import { apiRequest } from "@/services/api";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, login } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBirthday(user.birthday || "");
      setPhoneNumber(user.phone_number || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    try {
      setSaving(true);
      
      // Update user profile via backend
      const updatedUser = await apiRequest<any>(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          birthday: birthday.trim() || null,
          phone_number: phoneNumber.trim() || null,
          address: address.trim() || null,
        }),
      });

      // Update auth context with new user data
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUserData = {
          ...currentUser,
          name: updatedUser.name,
          email: updatedUser.email,
          birthday: updatedUser.birthday,
          phone_number: updatedUser.phone_number,
          address: updatedUser.address,
        };
        setCurrentUser(updatedUserData);
        login(updatedUserData);
      }

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert(
        "Error", 
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!user) {
    return (
      <View className="flex-1 bg-blue justify-center items-center">
        <ActivityIndicator size="large" color="#011A69" />
        <Text className="text-base text-white mt-4">Loading...</Text>
      </View>
    );
  }

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
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormField
                label="BIRTHDAY"
                value={birthday}
                placeholder="YYYY-MM-DD"
                onChangeText={setBirthday}
              />

              <FormField
                label="PHONE NUMBER"
                value={phoneNumber}
                placeholder="Enter your phone number"
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              <FormField
                label="ADDRESS"
                value={address}
                placeholder="Enter your address"
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
              />

              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 rounded-lg justify-center items-center py-4 mr-3"
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text className="text-base text-black font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-[#295298] rounded-lg justify-center items-center py-4"
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-base text-white font-bold">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}