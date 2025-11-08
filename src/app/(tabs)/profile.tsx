import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Button,
} from "react-native";
import { useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import ProfilePic from "../../../public/icons/basicProfile.svg";
import Star from "../../../public/icons/yellowStar.svg";
import Award from "../../../public/icons/award.svg";
import AwardInvert from "../../../public/icons/awardInvert.svg";
import { TopBar } from "@/components/TopBar";

export default function ProfileScreen() {
  const [isReview, setIsReview] = useState(true);
  const [isBadge, setIsBadge] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  const navigate = () => {
    router.replace("login");
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

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <View className="justify-center items-center p-5">
        <ProfilePic className="w-[50px] h-[100px]"/>
        <Text className="text-3xl text-black font-bold p-3 tracking-wide">
          John Doe
        </Text>
        <Text className="text-base text-black mb-2">
          jdoe002@ucr.edu
        </Text>
        <View className="flex flex-row flex-wrap justify-between p-1">
          <View className="w-2/5 justify-center items-center">
            <Text className="text-base text-black font-bold">
              20
            </Text>
            <Text className="text-base text-black">
              Reviews
            </Text>
          </View>
          <View className="w-2/5 justify-center items-center">
            <Text className="text-base text-black font-bold">
              100
            </Text>
            <Text className="text-base text-black">
              Likes
            </Text>
          </View>
        </View>
        <View className="w-full h-10 flex-row rounded-lg justify-center items-center mt-3">
          <TouchableOpacity className="w-[150px] h-6 bg-[#011A69] rounded-lg justify-center items-center mr-3" onPress={navigate}>
            <Text className="text-base text-white font-bold">
              Sign Out
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-[150px] h-6 bg-[#011A69] rounded-lg justify-center items-center">
            <Text className="text-base text-white font-bold">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
        <View className="w-full h-[100px] bg-[#295298] flex-row rounded-lg p-2">
          <Award  width={20} height={20}/>
          <Text className="text-base text-white font-bold ml-1">
            Rank Level
          </Text>
        </View>
        <View className="w-full h-10 bg-[#A1B1E4] flex-row rounded-full justify-center items-center mt-3 mb-3">
          <TouchableOpacity className={isReview ?  "w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4" : "w-[90px] h-6 bg-blue rounded-full justify-center items-center mr-4"} onPress={toggleReview}>
            <Text className="text-base text-black font-bold">
              Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className={isBadge ?  "w-[90px] h-6 bg-white rounded-full justify-center items-center mr-4" : "w-[90px] h-6 bg-blue rounded-full justify-center items-center mr-4"} onPress={toggleBadge}>
            <Text className="text-base text-black font-bold">
              Badges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className={isFavorite ? "w-[90px] h-6 bg-white rounded-full justify-center items-center" : "w-[90px] h-6 bg-blue rounded-full justify-center items-center"} onPress={toggleFavorite}>
            <Text className="text-base text-black font-bold">
              Favorites
            </Text>
          </TouchableOpacity>
        </View>

        {isReview ? (
            // This View will appear when isVisible is true
            <ScrollView className="h-full grow-0 w-full">
            <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
              <Text className="text-base text-black font-bold">
                Review
              </Text>
            </View>
            <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl justify-center items-center mb-3">
              <Text className="text-base text-black font-bold">
                Review
              </Text>
            </View>
          </ScrollView>
          ) : (<View></View>)
        }
        {isBadge ? (
          // This View will appear when isVisible is true
          <View className="w-full h-[120px] bg-[#C2D0FF] rounded-xl mb-3 p-1">
            <View className="justify-center items-center">
              <Text className="text-base text-black font-bold">
                Badges
              </Text>
            </View>
            <View className="">
              <AwardInvert  width={20} height={20}/>
              <AwardInvert  width={20} height={20}/>
              <AwardInvert  width={20} height={20}/>
              <AwardInvert  width={20} height={20}/>
            </View>
          </View>
        ) : (<View></View>)
        }

        {isFavorite ? (
          // This View will appear when isVisible is true
          <ScrollView className="h-full grow-0 w-full">
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
        ) : (<View></View>)
        }

        
      </View>
    </View>
  );
}
