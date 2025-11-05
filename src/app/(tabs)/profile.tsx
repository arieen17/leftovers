import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import ProfilePic from "../../../public/icons/basicProfile.svg";

export default function ProfileScreen() {
  const router = useRouter();
  const navigate = () => {
    router.replace("login");
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ProfilePic width={100} height={100} />
      <AppText size="large" bold>
        John Doe
      </AppText>
      <AppText size="medium">Jdoe002@ucr.edu</AppText>
      <AppText size="medium" bold>
        Reviews Likes
      </AppText>
      <View style={styles.BlueCenterBox}>
        <Text
          style={{
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Rank Level
        </Text>
      </View>
      <ScrollView style={{ height: 200, flexGrow: 0 }}>
        <View style={styles.ReviewBox}>
          <Text
            style={{
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Review
          </Text>
        </View>
        <View style={styles.ReviewBox}>
          <Text
            style={{
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Review
          </Text>
        </View>
        <View style={styles.ReviewBox}>
          <Text
            style={{
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Review
          </Text>
        </View>
        <View style={styles.ReviewBox}>
          <Text
            style={{
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Review
          </Text>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.SignOutBox} onPress={navigate}>
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  BlueCenterBox: {
    width: 300,
    height: 100,
    backgroundColor: "#2727bfff",
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 10,
  },
  ReviewBox: {
    width: 300,
    height: 100,
    backgroundColor: "#7070e1ff",
    marginBottom: 10,
    borderRadius: 10,
  },
  fixedBox: {
    width: 200,
    height: 100,
  },
  BlueBox: {
    width: 300,
    height: 50,
    backgroundColor: "#2727bfff",
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 10,
  },
  SignOutBox: {
    width: 250,
    height: 20,
    backgroundColor: "#FFFB26",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 5,
  },
});
