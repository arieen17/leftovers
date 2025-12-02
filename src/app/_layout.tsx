import { Stack } from "expo-router";
import "../../global.css";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Platform } from "react-native";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Bayon_400Regular } from "@expo-google-fonts/bayon";
import { PostsProvider } from "@/context/PostsContext";
import { AuthProvider } from "@/context/AuthContext";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for push notifications
async function registerForPushNotificationsAsync() {
  console.log('🔔 Starting notification setup...');
  
  let token;

  // Check if running on a physical device
  if (!Device.isDevice) {
    console.log('❌ Must use physical device for push notifications');
    return null;
  }

  console.log('✅ Running on physical device');

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('📋 Existing permission status:', existingStatus);
  
  let finalStatus = existingStatus;
  
  // Request permission if not granted
  if (existingStatus !== 'granted') {
    console.log('🔔 Requesting notification permission...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('📋 New permission status:', status);
  }
  
  // Exit if permission denied
  if (finalStatus !== 'granted') {
    console.log('❌ Notification permission denied');
    return null;
  }
  
  console.log('✅ Notification permission granted');
  
  try {
    // Get projectId from Expo config
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    console.log('🔍 Project ID:', projectId || 'Not found');
    
    if (projectId) {
      // Get Expo push token with projectId
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      token = tokenData.data;
      console.log('🎫 Expo Push Token:', token);
    } else {
      console.log('⚠️ No projectId found. Local notifications only.');
      // Test a local notification
      setTimeout(async () => {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "R'ATE",
              body: "Notifications are ready!",
              data: { test: 'setup' },
            },
            trigger: null,
          });
          console.log('✅ Test notification scheduled');
        } catch (error) {
          console.log('❌ Error scheduling test:', error);
        }
      }, 1000);
    }
    
  } catch (error) {
    console.log('❌ Error getting push token:', error);
  }

  return token;
}

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Bayon_400Regular,
  });

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.style.setProperty("color-scheme", "light");
    }
  }, []);

  // Notification setup useEffect
  useEffect(() => {
    console.log('🔧 Setting up notifications...');
    
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('✅ Push token obtained');
        // Send this token to your backend here
        // Example: await savePushTokenToBackend(token);
      } else {
        console.log('⚠️ Using local notifications');
      }
    });

    // Listen for notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification.request.content.title);
    });

    // Listen for notification responses (user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response.notification.request.content.data);
    });

    // Cleanup listeners
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <PostsProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="review" options={{ headerShown: false }} />
          <Stack.Screen
            name="menu-item-reviews"
            options={{ headerShown: false }}
          />
          {/* Add test screen */}
          <Stack.Screen 
            name="notification-test" 
            options={{ 
              headerShown: true, 
              title: 'Test Notifications',
              presentation: 'modal'
            }} 
          />
        </Stack>
      </PostsProvider>
    </AuthProvider>
  );
}