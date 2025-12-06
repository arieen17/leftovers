import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import NotificationTest from "../../app/notification-test";

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
}));

jest.spyOn(Alert, "alert");
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("NotificationTest Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render notification test screen", () => {
    const { getByText } = render(<NotificationTest />);
    expect(getByText("Notification Test")).toBeTruthy();
    expect(
      getByText("Press the button to send a test notification to your device."),
    ).toBeTruthy();
  });

  it("should display send test notification button", () => {
    const { getByText } = render(<NotificationTest />);
    expect(getByText("Send Test Notification")).toBeTruthy();
  });

  it("should send test notification when button is pressed", async () => {
    (
      Notifications.scheduleNotificationAsync as jest.Mock
    ).mockResolvedValueOnce("notification-id");

    const { getByText } = render(<NotificationTest />);
    const button = getByText("Send Test Notification");

    fireEvent.press(button);

    await waitFor(() => {
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "R'ATE Test",
          body: "This is a test notification from the app!",
          data: expect.objectContaining({
            screen: "test",
            timestamp: expect.any(Number),
          }),
        },
        trigger: null,
      });
    });
  });

  it("should show success alert on successful notification", async () => {
    (
      Notifications.scheduleNotificationAsync as jest.Mock
    ).mockResolvedValueOnce("notification-id");

    const { getByText } = render(<NotificationTest />);
    const button = getByText("Send Test Notification");

    fireEvent.press(button);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Test notification sent! Check your device.",
      );
    });
  });

  it("should show error alert on notification failure", async () => {
    const error = new Error("Notification failed");
    (
      Notifications.scheduleNotificationAsync as jest.Mock
    ).mockRejectedValueOnce(error);

    const { getByText } = render(<NotificationTest />);
    const button = getByText("Send Test Notification");

    fireEvent.press(button);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Error: Notification failed",
      );
    });
  });

  it("should include correct notification data", async () => {
    (
      Notifications.scheduleNotificationAsync as jest.Mock
    ).mockResolvedValueOnce("notification-id");

    const { getByText } = render(<NotificationTest />);
    const button = getByText("Send Test Notification");

    fireEvent.press(button);

    await waitFor(() => {
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock
        .calls[0][0];
      expect(call.content.title).toBe("R'ATE Test");
      expect(call.content.body).toBe(
        "This is a test notification from the app!",
      );
      expect(call.content.data.screen).toBe("test");
      expect(call.content.data.timestamp).toBeGreaterThan(0);
      expect(call.trigger).toBeNull();
    });
  });
});
