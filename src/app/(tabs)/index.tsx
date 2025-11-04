import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { AppText } from "@/components/AppText";
import BearIcon from "../../../public/images/bear.svg";
import Star from "../../../public/icons/yellowStar.svg"

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-blue">
        <View style={{flexDirection: 'row', padding: 20}}> 
          <Star width={20} height={20} style = {{marginHorizontal: 5}}/>
          <Text style={styles.bigFont}>
            Top Rated Dishes This Week
          </Text>
        </View>
        <ScrollView horizontal = {true} style = {{height:200, flexGrow: 0}}>
          <View style={styles.BlueCenterBox}>
            <Text style={{alignSelf:"center", alignItems:"center", justifyContent:"center"}}>
              Food Item
            </Text>
          </View>
          <View style={styles.BlueCenterBox}>
            <Text style={{alignSelf:"center", alignItems:"center", justifyContent:"center"}}>
              Food Item
            </Text>
          </View>
          <View style={styles.BlueCenterBox}>
            <Text style={{alignSelf:"center", alignItems:"center", justifyContent:"center"}}>
              Food Item
            </Text>
          </View>
        </ScrollView>
        <View style={{flexDirection: 'row', padding: 20}}> 
          <Star width={20} height={20} style = {{marginHorizontal: 5}}/>
          <Text style={styles.bigFont}>
            Your Reviews
          </Text>
        </View>
        <ScrollView horizontal = {true} style = {{height:200, flexGrow: 0}}>
          <View style={styles.BlueCenterBox}>
            <Text style={{alignSelf:"center", alignItems:"center", justifyContent:"center"}}>
              Review
            </Text>
          </View>
          <View style={styles.BlueCenterBox}>
            <Text style={{alignSelf:"center", alignItems:"center", justifyContent:"center"}}>
              Review
            </Text>
          </View>
          <View style={styles.BlueCenterBox}>
            <Text style={{alignSelf:"center", alignItems:"center", justifyContent:"center"}}>
              Review
            </Text>
          </View>
        </ScrollView>
      </View>
  );
}

  
const styles = StyleSheet.create({
  bigFont: {
    fontSize: 20,
    color:"#000000ff"
  },
  background: {
    flex: 1,
    backgroundColor: "#120E8F",
    justifyContent: "center",
    alignItems: "center",
  },
  BlueCenterBox: {
    width: 300,
    height: 200,
    backgroundColor: "#8b8beaff",
    alignSelf: 'center',
    alignItems: "center",
    marginLeft: 10,
    borderRadius: 10,
  },
});