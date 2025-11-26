import { View, Pressable, Image, Text, Alert } from "react-native";
import { Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { AppText } from "./AppText";

type PhotoPickerProps = {
  photo?: string;
  onPhotoChange: (uri: string | undefined) => void;
};

export function PhotoPicker({ photo, onPhotoChange }: PhotoPickerProps) {
  const openGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === "granted") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          onPhotoChange(result.assets[0].uri);
        }
      } else if (status === "undetermined") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to select photos.",
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Photo library access was denied. Please enable it in your device settings to select photos.",
        );
      }
    } catch {
      Alert.alert("Error", "Failed to access photos. Please try again.");
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status === "granted") {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          onPhotoChange(result.assets[0].uri);
        }
      } else if (status === "undetermined") {
        Alert.alert(
          "Permission Required",
          "Please grant camera access to take photos.",
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Camera access was denied. Please enable it in your device settings to take photos.",
        );
      }
    } catch {
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Select Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: openCamera,
        },
        {
          text: "Choose from Library",
          onPress: openGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View className="mb-6">
      <Text
        className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]"
        style={{ fontFamily: "Bayon_400Regular", letterSpacing: 2 }}
      >
        PHOTO
      </Text>
      <Pressable
        onPress={showImagePickerOptions}
        className="bg-[#F5F5DC] rounded-lg border border-[#E5E5D5] h-[150px] justify-center items-center overflow-hidden"
      >
        {photo ? (
          <Image
            source={{ uri: photo }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
            style={{ maxHeight: 150 }}
          />
        ) : (
          <View className="items-center">
            <Camera size={40} color="#9CA3AF" />
            <AppText size="medium" className="mt-2 text-gray-500">
              Add a photo
            </AppText>
          </View>
        )}
      </Pressable>
    </View>
  );
}
