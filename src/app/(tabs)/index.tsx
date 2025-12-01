import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "expo-router";
import StarIcon from "../../../public/icons/yellowStar.svg";
import { Star } from "lucide-react-native";
import { usePosts } from "@/context/PostsContext";
import { HorizontalReviewCard } from "@/components/HorizontalReviewCard";
import { TopBar } from "@/components/TopBar";
import { SearchBar } from "@/components/SearchBar";
import {
  searchRestaurantsAndItems,
  Restaurant,
  MenuItem,
} from "@/services/restaurantService";
import { getPopularItems } from "@/services/recommendationService";

interface PopularMenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string | null;
  tags: string[];
  created_at: string;
  restaurant_name?: string;
  average_rating?: string;
  review_count?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { posts } = usePosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    restaurants: Restaurant[];
    menuItems: MenuItem[];
  }>({ restaurants: [], menuItems: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [popularItems, setPopularItems] = useState<PopularMenuItem[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const loadPopularItems = async () => {
      try {
        setLoadingPopular(true);
        const items = await getPopularItems(5);
        setPopularItems(items as PopularMenuItem[]);
      } catch (error) {
        console.error("Error loading popular items:", error);
      } finally {
        setLoadingPopular(false);
      }
    };
    loadPopularItems();
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ restaurants: [], menuItems: [] });
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchRestaurantsAndItems(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ restaurants: [], menuItems: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const recentPosts = posts.slice(0, 5);
  const placeholderCount = Math.max(0, 5 - recentPosts.length);

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-200"
      onPress={() => {
        // Navigate to restaurant details if needed
        console.log("Navigate to restaurant:", item.id);
      }}
    >
      <Text className="text-lg font-bold text-black mb-1">{item.name}</Text>
      <Text className="text-sm text-gray-600 mb-1">{item.address}</Text>
      <Text className="text-xs text-blue-600">{item.cuisine_type}</Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-200"
      onPress={() => {
        // Navigate to menu item details if needed
        console.log("Navigate to menu item:", item.id);
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-black mb-1">{item.name}</Text>
          <Text className="text-sm text-gray-600 mb-1" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <Text className="text-base font-semibold text-blue-600 ml-2">
          ${item.price}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">{item.category}</Text>
        {item.average_rating && parseFloat(item.average_rating) > 0 && (
          <View className="flex-row items-center">
            <StarIcon width={14} height={14} />
            <Text className="text-xs text-gray-600 ml-1">
              {parseFloat(item.average_rating).toFixed(1)}
            </Text>
            {item.review_count && parseInt(item.review_count) > 0 && (
              <Text className="text-xs text-gray-500 ml-1">
                ({item.review_count})
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const showSearchResults = hasSearched && searchQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
      />
      {showSearchResults ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {isSearching ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#011A69" />
              <Text className="text-gray-600 mt-4">Searching...</Text>
            </View>
          ) : (
            <>
              {searchResults.restaurants.length === 0 &&
              searchResults.menuItems.length === 0 ? (
                <View className="flex-1 justify-center items-center py-20">
                  <Text className="text-gray-600 text-lg">
                    No results found
                  </Text>
                  <Text className="text-gray-500 text-sm mt-2">
                    Try a different search term
                  </Text>
                </View>
              ) : (
                <>
                  {searchResults.restaurants.length > 0 && (
                    <>
                      <View className="flex-row p-5 items-center">
                        <Text className="text-xl text-black font-bold">
                          Restaurants ({searchResults.restaurants.length})
                        </Text>
                      </View>
                      <FlatList
                        data={searchResults.restaurants}
                        renderItem={renderRestaurantItem}
                        keyExtractor={(item) => `restaurant-${item.id}`}
                        scrollEnabled={false}
                      />
                    </>
                  )}
                  {searchResults.menuItems.length > 0 && (
                    <>
                      <View className="flex-row p-5 items-center">
                        <Text className="text-xl text-black font-bold">
                          Menu Items ({searchResults.menuItems.length})
                        </Text>
                      </View>
                      <FlatList
                        data={searchResults.menuItems}
                        renderItem={renderMenuItem}
                        keyExtractor={(item) => `menu-item-${item.id}`}
                        scrollEnabled={false}
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row p-5">
            <StarIcon width={20} height={20} className="mx-1.5" />
            <Text className="text-xl text-black"> Most Popular Dishes</Text>
          </View>
          {loadingPopular ? (
            <View className="h-[220] justify-center items-center">
              <ActivityIndicator size="large" color="#295298" />
            </View>
          ) : (
            <ScrollView
              horizontal={true}
              className="h-[220] flex-grow-0"
              showsHorizontalScrollIndicator={false}
            >
              {popularItems.length > 0 ? (
                popularItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="w-[260] bg-white rounded-[10px] ml-2.5 mr-2.5 shadow-sm border border-gray-200 overflow-hidden"
                    onPress={() => {
                      router.push(`/review?menuItemId=${item.id}`);
                    }}
                  >
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-[120]"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-[120] bg-white justify-center items-center">
                        <Text className="text-gray-400 text-xs">No Image</Text>
                      </View>
                    )}
                    <View className="bg-[#FFFBE6] p-2 h-full">
                      <View className="flex-row justify-between items-start mb-0.5">
                        <Text
                          className="text-base font-bold text-gray-900 flex-1 mr-2"
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-base font-bold text-[#295298]">
                          ${item.price}
                        </Text>
                      </View>
                      {item.restaurant_name && (
                        <Text
                          className="text-xs text-gray-600 mb-1"
                          numberOfLines={1}
                        >
                          {item.restaurant_name}
                        </Text>
                      )}
                      {item.average_rating &&
                      parseFloat(item.average_rating) > 0 ? (
                        <View className="flex-row items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => {
                            const rating = Math.round(
                              parseFloat(item.average_rating!)
                            );
                            const isFilled = i < rating;
                            return (
                              <Star
                                key={i}
                                size={12}
                                fill={isFilled ? "#FFD700" : "transparent"}
                                color={isFilled ? "#FFD700" : "#D1D5DB"}
                                strokeWidth={2}
                              />
                            );
                          })}
                          {item.review_count &&
                            parseInt(item.review_count) > 0 && (
                              <Text className="text-xs text-gray-600 ml-1">
                                {item.review_count} Reviews
                              </Text>
                            )}
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="w-[300] h-[360] bg-gray-100 self-center items-center ml-2.5 rounded-[10px] justify-center">
                  <Text className="text-gray-500">
                    No popular items available
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
          <View className="mt-10 h-px bg-gray-300 mx-5 my-2" />
          <View className="flex-row p-5">
            <StarIcon width={20} height={20} className="mx-1.5" />
            <Text className="text-xl text-black"> Your Reviews</Text>
          </View>
          <ScrollView horizontal={true} className="h-[360] flex-grow-0">
            {recentPosts.map((post) => (
              <HorizontalReviewCard key={post.id} post={post} />
            ))}
            {Array.from({ length: placeholderCount }, (_, i) => (
              <View
                key={`placeholder-${i}`}
                className="w-[300] h-[360] bg-[#C5DCE9] self-center items-center ml-2.5 rounded-[10px] justify-center"
              >
                <Text className="self-center items-center justify-center">
                  Review
                </Text>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}
