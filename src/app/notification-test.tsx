import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function NotificationTest() {
const sendTestNotification = async () => {
  try {
    console.log('🔔 Sending test notification...');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "R'ATE Test",
        body: "This is a test notification from the app!",
        data: { screen: 'test', timestamp: Date.now() },
      },
      trigger: null,
    });
    
    Alert.alert('Success', 'Test notification sent! Check your device.');
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', String(error));
  }
};
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-6">Notification Test</Text>
      <Text className="text-center mb-8">
        Press the button to send a test notification to your device.
      </Text>
      <Button title="Send Test Notification" onPress={sendTestNotification} />
    </View>
  );
}