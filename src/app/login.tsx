import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image } from "react-native";
import { AppText } from "@/components/AppText";
import BearIcon from "../../public/images/bear.svg";
import { Redirect, useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const navigate = () => {
    router.replace("(tabs)");
  }
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View style={styles.background}> 
        <BearIcon width={100} height={100} />
        <Text style={styles.bigFont}>
          R'ATE
        </Text>
        <View style={styles.BlueCenterBox}>
          <View style={styles.LoginUsernameBox}>
            <TextInput placeholder={" Username"}/>
          </View>
          <View style={styles.LoginPasswordBox}>
            <TextInput placeholder={" Password"}/>
          </View>
          <TouchableOpacity style={styles.LoginSignInBox}>
            <Text style={{textAlign: 'center', fontWeight: 'bold'}} onPress={navigate}> 
              Sign In
            </Text>
          </TouchableOpacity>
          <Text style={{textAlign: 'center', fontWeight: 'bold'}}>or</Text>
          <TouchableOpacity style={styles.LoginUCREmailBox}>
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>Use with UCR Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
// onPress={() => navigation.navigate("/(tabs)/index.tsx")}
  
const styles = StyleSheet.create({
  bigFont: {
    fontSize: 48,
    color:"#FFFB26"
  },
  background: {
    flex: 1,
    width: '100%',
    backgroundColor: "#120E8F",
    justifyContent: "center",
    alignItems: "center",
  },
  BlueCenterBox: {
    width: 300,
    height: 400,
    backgroundColor: "#0000FF",
    alignSelf: 'center',
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 20,
  },
  LoginUsernameBox: {
    width: 250,
    height: 20,
    backgroundColor: "#FFFFFF",
    alignSelf: 'center',
    marginTop: 50,
    borderRadius: 5,
  },
  LoginPasswordBox: {
    width: 250,
    height: 20,
    backgroundColor: "#FFFFFF",
    alignSelf: 'center',
    marginTop: 30,
    borderRadius: 5,
  },
  LoginSignInBox: {
    width: 250,
    height: 20,
    backgroundColor: "#FFFB26",
    alignSelf: 'center',
    marginTop: 80,
    marginBottom: 30,
    borderRadius: 5,
  },
  LoginUCREmailBox: {
    width: 250,
    height: 20,
    backgroundColor: "#FFFB26",
    alignSelf: 'center',
    marginTop: 30,
    borderRadius: 5,
  },
});