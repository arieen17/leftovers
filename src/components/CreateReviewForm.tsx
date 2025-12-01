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
import { X, Plus } from "lucide-react-native";
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
import { createReview } from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";

export function CreateReviewForm() {
  const router = useRouter();
  const { addPost } = usePosts();
  const { isAuthenticated, user } = useAuth();
  const [restaurant, setRestaurant] = useState("");
  const [menuItem, setMenuItem] = useState("");
  const [rating, setRating] = useState(0);
  const [photo, setPhoto] = useState<string | undefined>();
  const [review, setReview] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | null>(
    null,
  );

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
      setSelectedMenuItemId(null);
    }

    setSelectedRestaurantId(newRestaurantId);
  };

  const handleMenuItemSelect = (menuItemName: string) => {
    setMenuItem(menuItemName);
    const selectedMenuItem = menuItems.find(
      (item) => item.name === menuItemName,
    );
    setSelectedMenuItemId(selectedMenuItem?.id || null);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputSubmit = () => {
    handleAddTag();
  };

  const handlePost = async () => {
    if (!restaurant || !menuItem || rating === 0 || !review.trim()) {
      Alert.alert("Please fill in all fields before posting");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert("Please log in to create a review");
      return;
    }

    if (!selectedMenuItemId) {
      Alert.alert("Error", "Please select a valid menu item");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create review in backend
      const createdReview = await createReview({
        menu_item_id: selectedMenuItemId,
        rating,
        comment: review,
        photos: photo ? [photo] : undefined,
      });

      // Also add to local posts context for immediate UI update
      addPost({
        restaurant,
        menuItem,
        rating,
        photo,
        review,
        tags: tags.length > 0 ? tags : undefined,
        reviewId: createdReview.id,
        menuItemId: selectedMenuItemId,
        userName: user?.name,
        likeCount: createdReview.like_count ?? 0,
        commentCount: createdReview.comment_count ?? 0,
      });

      setRestaurant("");
      setMenuItem("");
      setRating(0);
      setPhoto(undefined);
      setReview("");
      setTags([]);
      setTagInput("");
      setSelectedMenuItemId(null);

      router.push("/(tabs)");
    } catch (error) {
      console.error("Error creating review:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create review. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
                onSelect={handleMenuItemSelect}
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

          <View className="mb-6">
            <Text
              className="mb-2 text-black text-base font-bold font-bayon uppercase tracking-[2]"
              style={{ fontFamily: "Bayon_400Regular", letterSpacing: 2 }}
            >
              TAGS
            </Text>
            <View className="flex-row gap-2 mb-2">
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add a tag..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleTagInputSubmit}
                className="flex-1 bg-[#F5F5DC] rounded-lg px-4 py-3 border border-[#E5E5D5] text-base text-gray-900"
              />
              <Pressable
                onPress={handleAddTag}
                className="bg-blue-600 rounded-lg px-4 py-3 justify-center items-center"
              >
                <Plus size={20} color="#ffffff" />
              </Pressable>
            </View>
            {tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-blue-100 rounded-full px-3 py-1.5 flex-row items-center gap-2"
                  >
                    <Text className="text-blue-800 text-sm font-medium">
                      {tag}
                    </Text>
                    <Pressable
                      onPress={() => handleRemoveTag(tag)}
                      className="p-0.5"
                    >
                      <X size={14} color="#1E40AF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Pressable
            onPress={handlePost}
            disabled={isSubmitting}
            className="bg-[#FCD34D] rounded-lg px-5 py-4 items-center justify-center border border-[#FCD34D] disabled:opacity-50"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text className="font-bold text-lg text-black uppercase">
                POST
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
