import { Tabs } from "expo-router";
import { Platform } from "react-native";
import HomeIcon from "../../../public/icons/home.svg";
import HomeInvertIcon from "../../../public/icons/homeInvert.svg";
import MapPinIcon from "../../../public/icons/mappin.svg";
import MapPinInvertIcon from "../../../public/icons/mappinInvert.svg";
import PostIcon from "../../../public/icons/post.svg";
import PostInvertIcon from "../../../public/icons/postInvert.svg";
import DiscoverIcon from "../../../public/icons/discover.svg";
import DiscoverInvertIcon from "../../../public/icons/discoverInvert.svg";
import ProfileIcon from "../../../public/icons/profile.svg";
import ProfileInvertIcon from "../../../public/icons/profileInvert.svg";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#ffffff",
        tabBarStyle: {
          backgroundColor: "#295298",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 90 : 65,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          textTransform: "uppercase",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <HomeInvertIcon width={24} height={24} />
            ) : (
              <HomeIcon width={24} height={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MapPinInvertIcon width={24} height={24} />
            ) : (
              <MapPinIcon width={24} height={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <PostInvertIcon width={24} height={24} />
            ) : (
              <PostIcon width={24} height={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <DiscoverInvertIcon width={24} height={24} />
            ) : (
              <DiscoverIcon width={24} height={24} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <ProfileInvertIcon width={24} height={24} />
            ) : (
              <ProfileIcon width={24} height={24} />
            ),
        }}
      />
    </Tabs>
  );
}
