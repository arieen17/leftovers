import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { RotateCw } from "lucide-react-native";
import { AppText } from "@/components/AppText";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { getUserRecommendations, getPopularItems } from "@/services/recommendationService";
import { type MenuItem } from "@/services/restaurantService";

interface PopularMenuItem extends MenuItem {
  restaurant_name?: string;
  average_rating?: string;
  review_count?: string;
}

export default function DiscoverScreen() {
  const [forYouItems, setForYouItems] = useState<MenuItem[]>([]);
  const [popularItems, setPopularItems] = useState<PopularMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Always load popular items
      const popular = await getPopularItems(5);
      setPopularItems(popular);
      
      // Load personalized recommendations only for authenticated users
      if (isAuthenticated && user) {
        try {
          const personalized = await getUserRecommendations(5);
          console.log('Personalized recommendations:', personalized);
          setForYouItems(personalized);
        } catch (error) {
          // If no personalized recommendations, forYouItems remains empty
          console.log("No personalized recommendations available");
        }
      }
      
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecommendations();
  };

  useEffect(() => {
    loadRecommendations();
  }, [isAuthenticated, user]);

  const RecommendationItem = ({ item }: { item: MenuItem | PopularMenuItem }) => (
    <View className="bg-white rounded-lg border border-gray-200 p-3 flex-row mb-3">
      <View className="w-24 h-24 bg-[#F5F5DC] rounded-lg mr-3 items-center justify-center">
        <AppText size="small" className="text-center">
          {item.image_url ? "Image" : "No Image"}
        </AppText>
      </View>
      <View className="flex-1">
        <AppText bold className="text-gray-900 mb-1">
          {item.name}
        </AppText>
        <AppText size="small" className="text-gray-600 mb-1">
          {'restaurant_name' in item ? item.restaurant_name : ''}
        </AppText>
        <AppText size="small" className="text-gray-600 mb-2">
          {item.description || "No description available"}
        </AppText>
        <View className="flex-row justify-between items-center">
          <AppText bold className="text-[#295298]">
            ${item.price}
          </AppText>
          {'average_rating' in item && item.average_rating && (
            <AppText size="small" className="text-gray-600">
              ⭐ {parseFloat(item.average_rating).toFixed(1)} 
              {'review_count' in item && item.review_count && (
                <AppText size="small" className="text-gray-500">
                  {' '}({item.review_count} reviews)
                </AppText>
              )}
            </AppText>
          )}
        </View>
        {item.tags && item.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} className="bg-[#E5E7EB] rounded-full px-2 py-1 mr-1 mb-1">
                <AppText size="small" className="text-gray-700">
                  {tag}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <ScrollView className="flex-1">
        <View className="bg-[#AAD7EB] px-4 pt-3 items-center">
          <AppText size="large" bold className="text-[#295298]">
            Discover
          </AppText>
        </View>

        <View className="px-4 py-3 items-center gap-3">
          <Pressable 
            className="flex-row items-center gap-2"
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RotateCw size={16} color="#6B7280" />
            <AppText size="small" className="text-gray-600 mb-0">
              {refreshing ? "Refreshing..." : "Refresh Recommendations"}
            </AppText>
          </Pressable>
        </View>

        <View className="p-4">
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#295298" />
              <AppText className="text-gray-600 mt-2">Loading recommendations...</AppText>
            </View>
          ) : (
            <>
              {/* For You Section */}
              <View className="mb-6">
                <AppText size="large" bold className="text-gray-900 mb-3">
                  For You
                </AppText>
                
                {isAuthenticated ? (
                  forYouItems.length > 0 ? (
                    forYouItems.map((item) => (
                      <RecommendationItem key={item.id} item={item} />
                    ))
                  ) : (
                    <View className="bg-white rounded-lg border border-gray-200 p-4 items-center">
                      <AppText className="text-gray-600 text-center mb-2">
                        Rate more dishes to get personalized recommendations
                      </AppText>
                      <AppText size="small" className="text-gray-500 text-center">
                        The more you rate, the better we can suggest dishes you'll love
                      </AppText>
                    </View>
                  )
                ) : (
                  <View className="bg-white rounded-lg border border-gray-200 p-4 items-center">
                    <AppText className="text-gray-600 text-center">
                      Sign in to get personalized recommendations
                    </AppText>
                  </View>
                )}
              </View>

              {/* Popular Near You Section */}
              <View>
                <AppText size="large" bold className="text-gray-900 mb-3">
                  Popular Near You
                </AppText>
                
                {popularItems.length > 0 ? (
                  popularItems.map((item) => (
                    <RecommendationItem key={item.id} item={item} />
                  ))
                ) : (
                  <View className="bg-white rounded-lg border border-gray-200 p-4 items-center">
                    <AppText className="text-gray-600">
                      No popular items available
                    </AppText>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}