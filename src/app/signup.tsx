import { View, TextInput, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useState } from "react";
import BearIcon from "../../public/images/bear.svg";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { signup, type SignupCredentials } from "@/services/authService";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!email.endsWith('@ucr.edu')) {
      Alert.alert("Error", "Please use a valid UCR email address");
      return;
    }

    try {
      setLoading(true);
      const credentials: SignupCredentials = { 
        email, 
        password, 
        name,
        // Optional fields can be added later
      };
      const response = await signup(credentials);
      
      // Update auth context with user data
      authLogin(response.user);
      
      // Navigate to main app
      router.replace("(tabs)");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert(
        "Signup Failed", 
        error.message || "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.replace("login");
  };

  return (
    <View className="flex-1 bg-[#295298]">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 w-full bg-[#295298] justify-center items-center px-2 py-8">
          <View className="items-center mb-5">
            <BearIcon width={100} height={100} />
            <Text className="text-5xl text-white font-bold uppercase mt-2.5 tracking-wide">
              R&apos;ATE
            </Text>
            <Text className="text-base text-white mt-1.5">
              Join UCR's Foodie Community
            </Text>
          </View>

          <View className="w-[85%] bg-[#FFF3AE] rounded-3xl p-6 items-start mb-10 shadow-lg">
            <Text className="text-base text-black font-semibold mb-2">
              Full Name
            </Text>
            <TextInput
              className="w-full h-12 bg-white shadow-sm rounded-full px-4 text-base text-black"
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-base text-black font-semibold mt-4 mb-2">
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

            <Text className="text-base text-black font-semibold mt-4 mb-2">
              Confirm Password
            </Text>
            <TextInput
              className="w-full h-12 bg-white shadow-sm rounded-full px-4 text-base text-black"
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              className="w-full h-12 bg-[#295298] rounded-full justify-center items-center mt-6"
              onPress={handleSignup}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-semibold">Sign Up</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center w-full my-5">
              <View className="flex-1 h-px bg-gray-500" />
              <Text className="text-gray-500 text-sm mx-3">OR</Text>
              <View className="flex-1 h-px bg-gray-500" />
            </View>

            <TouchableOpacity 
              className="w-full h-12 bg-white rounded-full justify-center items-center shadow-sm"
              onPress={navigateToLogin}
            >
              <Text className="text-black text-base font-semibold">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}