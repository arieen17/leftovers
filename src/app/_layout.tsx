import { Stack } from "expo-router";
import "../../global.css";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Bayon_400Regular } from "@expo-google-fonts/bayon";
import { PostsProvider } from "@/context/PostsContext";

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Bayon_400Regular,
  });

  // Add this useEffect to fix dark mode error
  useEffect(() => {
    // This prevents the dark mode configuration error
    if (typeof window !== 'undefined') {
      // Set a default color scheme to avoid the media query issue
      document.documentElement.style.setProperty('color-scheme', 'light');
    }
  }, []);

  return (
    <PostsProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="review" options={{ headerShown: false }} />
      </Stack>
    </PostsProvider>
  );
}