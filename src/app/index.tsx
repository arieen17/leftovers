import { View, StyleSheet, TextInput, Text, TouchableOpacity} from "react-native";
import { AppText } from "@/components/AppText";

export default function IndexScreen() {
  return (
    <View className="justify-center flex-1 p-4">
      <View style={styles.background}> 
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
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>Sign In</Text>
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

const styles = StyleSheet.create({
  bigFont: {
    fontSize: 48,
    color:"#FFFB26"
  },
  background: {
    flex: 1,
    backgroundColor: "#120E8F",
    justifyContent: "center",
    alignItems: "center",
  },
  BlueCenterBox: {
    width: 300,
    height: 400,
    backgroundColor: "#0000FF",
    alignSelf: 'center',
    marginBottom: 20,
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
    marginTop: 60,
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
  }
});