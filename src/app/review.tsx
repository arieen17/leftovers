import { TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
    const router = useRouter();
    const backMenu = () => {
        router.replace("(tabs)");
    };

    return (
        <View className="flex-1 bg-[#0000FF] items-center p-1">
            <TouchableOpacity className="w-[100] h-[20] bg-white justify-center items-center" onPress={backMenu}>
                <Text className="font-bold">
                    Back to Menu
                </Text>
            </TouchableOpacity>
        </View>
    )
}