import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Star from "../../../public/icons/yellowStar.svg";
import { Post, usePosts } from "@/context/PostsContext";
import { HorizontalReviewCard } from "@/components/HorizontalReviewCard";
import { TopBar } from "@/components/TopBar";
import { SearchBar } from "@/components/SearchBar";
import { useRouter } from "expo-router";
import Review from "@/app/review";

export default function HomeScreen() {
  const { posts } = usePosts();
  const router = useRouter();
  const reviewExpand = (id: string) => {
    router.replace({pathname: "review", params: {id}});
  };

  const recentPosts = posts.slice(0, 5);

  const placeholderCount = Math.max(0, 5 - recentPosts.length);

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <SearchBar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row p-5">
          <Star width={20} height={20} className="mx-1.5" />
          <Text className="text-xl text-black">Top Rated Dishes This Week</Text>
        </View>
        <ScrollView horizontal={true} className="h-[200] flex-grow-0">
          <View className="w-[300] h-[360] bg-[#8b8beaff] self-center items-center ml-2.5 rounded-[10px] justify-center">
            <Text className="self-center items-center justify-center">
              Food Item
            </Text>
          </View>
          <View className="w-[300] h-[360] bg-[#8b8beaff] self-center items-center ml-2.5 rounded-[10px] justify-center">
            <Text className="self-center items-center justify-center">
              Food Item
            </Text>
          </View>
          <View className="w-[300] h-[360] bg-[#8b8beaff] self-center items-center ml-2.5 rounded-[10px] justify-center">
            <Text className="self-center items-center justify-center">
              Food Item
            </Text>
          </View>
        </ScrollView>
        <View className="mt-10 h-px bg-gray-300 mx-5 my-2" />
        <View className="flex-row p-5">
          <Star width={20} height={20} className="mx-1.5" />
          <Text className="text-xl text-black">Your Reviews</Text>
        </View>
        <ScrollView horizontal={true} className="h-[360] flex-grow-0">
          {recentPosts.map((post) => (
            <TouchableOpacity onPress={() => reviewExpand(post.id)}>
            <HorizontalReviewCard key={post.id} post={post} />
            </TouchableOpacity>
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
    </View>
  );
}
