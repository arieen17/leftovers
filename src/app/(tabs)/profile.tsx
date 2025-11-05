import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import ProfilePic from "../../../public/icons/basicProfile.svg";


export default function ProfileScreen() {
  const router = useRouter();
    const navigate = () => {
      router.replace("login");
    }

  return (
    <View className="flex-1 justify-center items-center bg-white p-10">
      <View className="mt-10"/>
      <ProfilePic className="w-[50px] h-[100px]"/>
      <Text className="text-3xl text-black font-bold p-3 tracking-wide">
        John Doe
      </Text>
      <Text className="text-base text-black mb-2">
        jdoe002@ucr.edu
      </Text>
      <View className="justify-center items-center">
        <Text className="text-base text-black font-bold">
          20                       100
        </Text>
        <Text className="text-base text-black">
          Reviews                Likes
        </Text>
      </View>
      <View className="w-full h-10 flex-row rounded-lg justify-center items-center mt-3 mb-2">
        <TouchableOpacity className="w-[150px] h-6 bg-[#011A69] rounded-lg justify-center items-center mr-3" onPress={navigate}>
          <Text className="text-base text-white font-bold">
            Sign Out
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-[150px] h-6 bg-[#011A69] rounded-lg justify-center items-center" onPress={navigate}>
          <Text className="text-base text-white font-bold">
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>
      <View className="w-full h-[100px] bg-[#295298] rounded-lg mt-2 p-2">
        <Text className="text-base text-white font-bold ml-2">
          * Rank Level *
        </Text>
      </View>
      <View className="w-full h-10 bg-[#A1B1E4] flex-row rounded-full justify-center items-center mt-3 mb-2">
        <TouchableOpacity className="w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4">
          <Text className="text-base text-black font-bold">
            Reviews
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4">
          <Text className="text-base text-black font-bold">
            Badges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-[90px] h-6 bg-white rounded-full justify-center items-center">
          <Text className="text-base text-black font-bold">
            Favorites
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="h-full grow-0 w-full">
        <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-6">
          <Text className="text-base text-black font-bold">
            Review
          </Text>
        </View>
        <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-6">
          <Text className="text-base text-black font-bold">
            Review
          </Text>
        </View>
        <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-6">
          <Text className="text-base text-black font-bold">
            Review
          </Text>
        </View>
        <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-6">
          <Text className="text-base text-black font-bold">
            Review
          </Text> 
        </View>
      </ScrollView>
    </View>
  );
}