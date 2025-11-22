import { View, TextInput, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import BearIcon from "../../public/images/bear.svg";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { login, type LoginCredentials } from "@/services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const credentials: LoginCredentials = { email, password };
      const response = await login(credentials);
      
      // Update auth context with user data
      authLogin(response.user);
      
      // Navigate to main app (existing functionality)
      router.replace("(tabs)");
      
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed", 
        error.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push("signup");
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
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-base text-black font-semibold mt-4 mb-2">
            Password
          </Text>
          <TextInput
            className="w-full h-12 bg-white shadow-sm rounded-full px-4 text-base text-black"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            className="w-full h-12 bg-[#295298] rounded-full justify-center items-center mt-6"
            onPress={handleLogin}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-semibold">Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="w-full items-center mt-3">
            <Text className="text-gray-500 text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          <View className="flex-row items-center w-full my-5">
            <View className="flex-1 h-px bg-gray-500" />
            <Text className="text-gray-500 text-sm mx-3">OR</Text>
            <View className="flex-1 h-px bg-gray-500" />
          </View>

          <TouchableOpacity 
            className="w-full h-12 bg-white rounded-full justify-center items-center shadow-sm"
            onPress={navigateToSignup}
          >
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