import { View, TextInput, Text, TouchableOpacity } from "react-native";
import BearIcon from "../../public/images/bear.svg";
import { useRouter } from "expo-router";


export default function LoginScreen() {
  const router = useRouter();
  const navigate = () => {
    router.replace("(tabs)");
  };
  return (
    <View className="flex-1 bg-[#295298]">
      <View className="flex-1 w-full bg-[#295298] justify-center items-center px-2">
        <View className="items-center mb-5">
          <BearIcon width={100} height={100} />
          <Text className="text-5xl text-white font-bold uppercase mt-2.5 tracking-wide">
            R&apos;ATE
          </Text>
          <Text className="text-base text-white mt-1.5">
            Rate what you ate!
          </Text>
        </View>

        <View className="w-[85%] bg-[#FFF3AE] rounded-3xl p-6 items-start mb-10 shadow-lg">
          <Text className="text-base text-black font-semibold mb-2 mt-0">
            UCR Email
          </Text>
          <TextInput
            className="w-full h-12 bg-white shadow-sm rounded-full px-4 text-base text-black"
            placeholder="student@ucr.edu"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text className="text-base text-black font-semibold mt-4 mb-2">
            Password
          </Text>
          <TextInput
            className="w-full h-12 bg-white shadow-sm rounded-full px-4 text-base text-black"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />

          <TouchableOpacity
            className="w-full h-12 bg-[#295298] rounded-full justify-center items-center mt-6"
            onPress={navigate}
          >
            <Text className="text-white text-base font-semibold">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-full items-center mt-3">
            <Text className="text-gray-500 text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          <View className="flex-row items-center w-full my-5">
            <View className="flex-1 h-px bg-gray-500" />
            <Text className="text-gray-500 text-sm mx-3">OR</Text>
            <View className="flex-1 h-px bg-gray-500" />
          </View>

          <TouchableOpacity className="w-full h-12 bg-white rounded-full justify-center items-center shadow-sm">
            <Text className="text-black text-base font-semibold">
              Sign Up with UCR EMAIL
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-sm text-center">
          Join UCR&apos;s Foodie Community
        </Text>
      </View>
    </View>
  );
}
