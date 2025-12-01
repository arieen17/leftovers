import { TouchableOpacity, View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Post, usePosts } from "@/context/PostsContext";
import { TopBar } from "@/components/TopBar";
import BackArrow from "../../public/icons/chevron-left.svg";
import Comment from "../../public/icons/message-circle-more.svg";
import Heart from "../../public/icons/heart.svg";

export default function ReviewScreen() {
  const [isLike, setIsLike] = useState(true);
  const { posts } = usePosts();
  const { id: currentPostID } = useLocalSearchParams();
  const currentPost = posts.find((post) => post.id === currentPostID);
  const router = useRouter();
  const backMenu = () => {
    router.replace("(tabs)");
  };
  const toggleLike = () => {
    setIsLike(!isLike);
  };

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <TopBar />
      <View className="bg-[#C5DCE9]">
        <TouchableOpacity
          className="w-[150] h-[20] justify-center p-4"
          onPress={backMenu}
        >
          <View className="flex-row">
            <BackArrow className="w-[20] h-[20]" />
            <Text className="font-bold">Back to Menu</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View className="bg-[#FEF7E8] p-4">
        <View className="flex-row px-3 pb-2 items-start">
          <View className="w-10 h-10 rounded-full bg-gray-300 mr-2 overflow-hidden">
            <View className="w-full h-full bg-gray-200 justify-center items-center">
              <Text className="text-base text-gray-500">JD</Text>
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800 mb-0.5">
              John Doe
            </Text>
            <Text className="text-[11px] text-gray-400">Today</Text>
          </View>
        </View>
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-gray-800 mb-0.5">
          {currentPost?.menuItem}
        </Text>
        <Text className="text-xs text-gray-500">{currentPost?.restaurant}</Text>
        {currentPost?.photo ? (
          <View className="px-3">
            <Image
              source={{ uri: currentPost.photo }}
              className="w-full h-[200] rounded-lg"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View className="px-3">
            <View className="w-full h-[200] bg-[#F5F5DC] rounded-lg justify-center items-center">
              <Text className="text-gray-400 text-xs">No Photo</Text>
            </View>
          </View>
        )}
        <View className="flex-row items-center p-1">
          <TouchableOpacity onPress={toggleLike}>
            {isLike ? <Heart /> : <Heart className="fill-red-500" />}
          </TouchableOpacity>
          <Text></Text>
          <Comment className="ml-3" />
          <Text>13</Text>
        </View>
        <View className="p-1">
          <Text className="text-small text-black-500">
            {currentPost?.review}
          </Text>
        </View>
      </View>

      <ScrollView className="h-[190px] grow-0 w-full">
        <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
          <Text className="text-base text-black font-bold">Comment</Text>
        </View>
        <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
          <Text className="text-base text-black font-bold">Comment</Text>
        </View>
      </ScrollView>
    </View>
  );
}
