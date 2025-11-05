import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "./AppText";
import { Dropdown } from "./Dropdown";
import { StarRating } from "./StarRating";
import { PhotoPicker } from "./PhotoPicker";
import { usePosts } from "@/context/PostsContext";
import {
  fetchRestaurants,
  fetchRestaurantMenu,
  type Restaurant,
  type MenuItem,
} from "@/services/restaurantService";

export function CreateReviewForm() {
  const router = useRouter();
  const { addPost } = usePosts();
  const [restaurant, setRestaurant] = useState("");
  const [menuItem, setMenuItem] = useState("");
  const [rating, setRating] = useState(0);
  const [photo, setPhoto] = useState<string | undefined>();
  const [review, setReview] = useState("");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenuItems(selectedRestaurantId);
    } else {
      setMenuItems([]);
      setMenuItem("");
    }
  }, [selectedRestaurantId]);

  const loadRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const data = await fetchRestaurants();

      if (!data || data.length === 0) {
        setRestaurants([]);
        Alert.alert(
          "No Restaurants Found",
          "The database appears to be empty. Please add restaurants to the database first.",
        );
      } else {
        setRestaurants(data);
      }
    } catch (error) {
      setRestaurants([]);
      const errorMessage =
        error instanceof Error ? error.message : "Network request failed";
      Alert.alert(
        "Connection Error",
        `Unable to load restaurants.\n\nError: ${errorMessage}\n\nPlease check:\n1. Backend is running on port 5000\n2. If using Expo Go, use your computer's IP instead of localhost\n3. Both devices are on the same WiFi network`,
      );
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const loadMenuItems = async (restaurantId: number) => {
    try {
      setLoadingMenuItems(true);
      const data = await fetchRestaurantMenu(restaurantId);
      setMenuItems(data);
    } catch {
      Alert.alert("Error", "Unable to load menu items for this restaurant.");
    } finally {
      setLoadingMenuItems(false);
    }
  };

  const handleRestaurantSelect = (restaurantName: string) => {
    setRestaurant(restaurantName);
    const selectedRestaurant = restaurants.find(
      (r) => r.name === restaurantName,
    );
    const newRestaurantId = selectedRestaurant?.id || null;

    if (selectedRestaurantId !== newRestaurantId) {
      setMenuItem("");
    }

    setSelectedRestaurantId(newRestaurantId);
  };

  const handlePost = () => {
    if (!restaurant || !menuItem || rating === 0 || !review.trim()) {
      Alert.alert("Please fill in all fields before posting");
      return;
    }

    addPost({
      restaurant,
      menuItem,
      rating,
      photo,
      review,
    });

    setRestaurant("");
    setMenuItem("");
    setRating(0);
    setPhoto(undefined);
    setReview("");

    router.push("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-light-blue"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-gray-50 rounded-2xl p-6">
          <AppText size="heading" bold className="mb-6 text-center text-black">
            Create a Review
          </AppText>

          <View className="mb-6">
            <Text
              className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]"
              style={{ fontFamily: "Bayon_400Regular", letterSpacing: 2 }}
            >
              RESTAURANT
            </Text>
            <Dropdown
              label=""
              value={restaurant}
              placeholder="Select Restaurant..."
              options={restaurants.map((r) => r.name)}
              onSelect={handleRestaurantSelect}
              searchable
            />
          </View>

          <View className="mb-6">
            <Text
              className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]"
              style={{ fontFamily: "Bayon_400Regular", letterSpacing: 2 }}
            >
              MENU ITEM
            </Text>
            {!selectedRestaurantId ? (
              <View className="bg-[#F5F5DC] rounded-lg px-4 py-3 border border-[#E5E5D5]">
                <Text className="text-gray-400 text-base">
                  Select a restaurant first...
                </Text>
              </View>
            ) : loadingMenuItems ? (
              <View className="bg-[#F5F5DC] rounded-lg px-4 py-3 border border-[#E5E5D5] items-center justify-center">
                <ActivityIndicator size="small" color="#6B7280" />
                <Text className="text-gray-500 text-sm mt-2">
                  Loading menu items...
                </Text>
              </View>
            ) : (
              <Dropdown
                label=""
                value={menuItem}
                placeholder="Select item..."
                options={menuItems.map((item) => item.name)}
                onSelect={setMenuItem}
              />
            )}
          </View>

          <View className="mb-6">
            <Text
              className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]"
              style={{ fontFamily: "Bayon_400Regular", letterSpacing: 2 }}
            >
              RATING
            </Text>
            <View className="items-center">
              <StarRating rating={rating} onRatingChange={setRating} />
            </View>
          </View>

          <PhotoPicker photo={photo} onPhotoChange={setPhoto} />

          <View className="mb-6">
            <Text
              className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]"
              style={{ fontFamily: "Bayon_400Regular", letterSpacing: 2 }}
            >
              REVIEW
            </Text>
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="Share experience with this dish..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              className="bg-[#F5F5DC] rounded-lg px-4 py-3 border border-[#E5E5D5] text-base text-gray-900 min-h-[120px]"
              textAlignVertical="top"
            />
          </View>

          <Pressable
            onPress={handlePost}
            className="bg-[#FCD34D] rounded-lg px-5 py-4 items-center justify-center border border-[#FCD34D]"
          >
            <Text className="font-bold text-lg text-black uppercase">POST</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
