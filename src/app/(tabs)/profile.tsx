import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import ProfilePic from "../../../public/icons/basicProfile.svg";
import Star from "../../../public/icons/yellowStar.svg";
import Award from "../../../public/icons/award.svg";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { getUserReviews, type Review } from "@/services/userService";

export default function ProfileScreen() {
  const [isReview, setIsReview] = useState(true);
  const [isBadge, setIsBadge] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && isReview) {
      loadUserReviews();
    }
  }, [isAuthenticated, user, isReview]);

  const loadUserReviews = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const reviews = await getUserReviews(user.id);
      setUserReviews(reviews);
    } catch (error) {
      console.error("Error loading user reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("login");
  };

  const navigateToEditProfile = () => {
    router.push("edit-profile");
  };

  const toggleReview = () => {
    setIsBadge(false);
    setIsFavorite(false);
    setIsReview(true);
  };

  const toggleBadge = () => {
    setIsBadge(true);
    setIsFavorite(false);
    setIsReview(false);
  };

  const toggleFavorite = () => {
    setIsBadge(false);
    setIsFavorite(true);
    setIsReview(false);
  };

  // Show loading if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 bg-blue justify-center items-center">
        <ActivityIndicator size="large" color="#011A69" />
        <Text className="text-base text-black mt-4">Loading user data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <View className="justify-center items-center p-5">
        <ProfilePic className="w-[50px] h-[100px]" />
        <Text className="text-3xl text-black font-bold p-3 tracking-wide">
          {user.name}
        </Text>
        <Text className="text-base text-black mb-2">{user.email}</Text>
        <View className="flex flex-row flex-wrap justify-between p-1">
          <View className="w-2/5 justify-center items-center">
            <Text className="text-base text-black font-bold">
              {userReviews.length}
            </Text>
            <Text className="text-base text-black">Reviews</Text>
          </View>
          <View className="w-2/5 justify-center items-center">
            <Text className="text-base text-black font-bold">100</Text>
            <Text className="text-base text-black">Likes</Text>
          </View>
        </View>
        <View className="w-full h-10 flex-row rounded-lg justify-center items-center mt-3">
          <TouchableOpacity
            className="w-[150px] h-6 bg-[#011A69] rounded-lg justify-center items-center mr-3"
            onPress={handleLogout}
          >
            <Text className="text-base text-white font-bold">Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[150px] h-6 bg-[#011A69] rounded-lg justify-center items-center"
            onPress={navigateToEditProfile}
          >
            <Text className="text-base text-white font-bold">Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View className="w-full h-[100px] bg-[#295298] flex-row rounded-lg p-2">
          <Award width={20} height={20} />
          <Text className="text-base text-white font-bold ml-1">
            Rank Level: {user.tier}
          </Text>
        </View>
        <View className="w-full h-10 bg-[#A1B1E4] flex-row rounded-full justify-center items-center mt-3 mb-3">
          <TouchableOpacity
            className={
              isReview
                ? "w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4"
                : "w-[90px] h-6 bg-blue rounded-full justify-center items-center mr-4"
            }
            onPress={toggleReview}
          >
            <Text className="text-base text-black font-bold">Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={
              isBadge
                ? "w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4"
                : "w-[90px] h-6 bg-blue rounded-full justify-center items-center mr-4"
            }
            onPress={toggleBadge}
          >
            <Text className="text-base text-black font-bold">Badges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={
              isFavorite
                ? "w-[90px] h-6 bg-white rounded-full justify-center items-center"
                : "w-[90px] h-6 bg-blue rounded-full justify-center items-center"
            }
            onPress={toggleFavorite}
          >
            <Text className="text-base text-black font-bold">Favorites</Text>
          </TouchableOpacity>
        </View>

        {isReview ? (
          <ScrollView className="h-[190px] grow-0 w-full">
            {loading ? (
              <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
                <ActivityIndicator size="small" color="#011A69" />
                <Text className="text-base text-black mt-2">Loading reviews...</Text>
              </View>
            ) : userReviews.length > 0 ? (
              userReviews.map((review) => (
                <View 
                  key={review.id} 
                  className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3 p-3"
                >
                  <Text className="text-base text-black font-bold">
                    {review.menu_item_name || "Menu Item"}
                  </Text>
                  <Text className="text-sm text-black text-center">
                    {review.comment}
                  </Text>
                  <Text className="text-sm text-black">
                    Rating: {review.rating}/5
                  </Text>
                </View>
              ))
            ) : (
              <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
                <Text className="text-base text-black font-bold">No reviews yet</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View></View>
        )}

        {isBadge ? (
          <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl mb-3 p-1">
            <View className="justify-center items-center">
              <Text className="text-base text-black font-bold">Badges</Text>
            </View>
            <View className="flex-row justify-center mt-2">
              <Award width={20} height={20} />
              <Award width={20} height={20} />
              <Award width={20} height={20} />
              <Award width={20} height={20} />
            </View>
          </View>
        ) : (
          <View></View>
        )}

        {isFavorite ? (
          <ScrollView className="h-[190px] grow-0 w-full">
            <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
              <Star width={20} height={20} className="mx-1.5" />
              <Text className="text-base text-black font-bold">
                Favorite Dish
              </Text>
            </View>
            <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
              <Star width={20} height={20} className="mx-1.5" />
              <Text className="text-base text-black font-bold">
                Favorite Dish
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View></View>
        )}
      </View>
    </View>
  );
}